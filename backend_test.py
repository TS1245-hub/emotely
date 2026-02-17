import requests
import sys
import json
from datetime import datetime

class JobApplicationTrackerAPITester:
    def __init__(self, base_url="https://telework-finder.preview.emergentagent.com"):
        self.base_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_applications = []
        self.created_alerts = []
        
    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, headers=headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
                
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.content else {}
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}
                
        except Exception as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            self.failed_tests.append(f"{name}: Network Error - {str(e)}")
            return False, {}
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)
    
    def test_get_applications(self):
        """Test getting all applications"""
        success, data = self.run_test("Get Applications", "GET", "applications", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} applications")
            # Check if we have test applications
            if len(data) >= 3:
                print("   ✓ Has expected test applications")
            else:
                print(f"   ⚠ Expected at least 3 test applications, found {len(data)}")
        return success, data
    
    def test_get_applications_with_status_filter(self):
        """Test filtering applications by status"""
        params = {"status": "À postuler"}
        success, data = self.run_test("Filter Applications by Status", "GET", "applications", 200, params=params)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} applications with status 'À postuler'")
            # Verify all results have correct status
            all_correct_status = all(app.get('status') == 'À postuler' for app in data)
            if all_correct_status:
                print("   ✓ All results have correct status")
            else:
                print("   ⚠ Some results don't have correct status")
        return success, data
    
    def test_get_applications_with_search(self):
        """Test searching applications by title/company"""
        params = {"search": "développeur"}
        success, data = self.run_test("Search Applications", "GET", "applications", 200, params=params)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} applications matching 'développeur'")
        return success, data
    
    def test_create_application(self):
        """Test creating a new job application"""
        application_data = {
            "title": "Développeur Full Stack Test",
            "company": "TechCorp Test",
            "url": f"https://example.com/job/{datetime.now().timestamp()}",
            "location": "Paris, France (Remote)",
            "job_type": "CDI",
            "salary": "50-70k€",
            "source": "manual",
            "status": "À postuler",
            "description": "Test job application for API testing",
            "notes": "Application créée via test automatisé"
        }
        success, data = self.run_test("Create Application", "POST", "applications", 200, application_data)
        if success:
            print(f"   Created application with ID: {data.get('id')}")
            if data.get('id'):
                self.created_applications.append(data['id'])
        return success, data
    
    def test_get_single_application(self):
        """Test getting a single application by ID"""
        if not self.created_applications:
            print("⚠ No application ID available - skipping test")
            return True, {}
        
        app_id = self.created_applications[0]
        success, data = self.run_test("Get Single Application", "GET", f"applications/{app_id}", 200)
        if success:
            print(f"   Application: {data.get('title', 'Unknown')}")
            print(f"   Company: {data.get('company', 'Unknown')}")
            print(f"   Status: {data.get('status', 'Unknown')}")
        return success, data
    
    def test_get_application_not_found(self):
        """Test getting non-existent application"""
        return self.run_test("Get Application Not Found", "GET", "applications/nonexistent-id", 404)
    
    def test_update_application_status(self):
        """Test updating application status via PATCH"""
        if not self.created_applications:
            print("⚠ No application ID available - skipping test")
            return True, {}
        
        app_id = self.created_applications[0]
        params = {"status": "Postulé"}
        success, data = self.run_test("Update Application Status", "PATCH", f"applications/{app_id}/status", 200, params=params)
        if success:
            print(f"   Status updated to: {data.get('status', 'Unknown')}")
        return success, data
    
    def test_update_application_full(self):
        """Test full application update via PUT"""
        if not self.created_applications:
            print("⚠ No application ID available - skipping test")
            return True, {}
        
        app_id = self.created_applications[0]
        update_data = {
            "title": "Développeur Full Stack Updated",
            "notes": "Notes mises à jour via test API"
        }
        success, data = self.run_test("Update Application Full", "PUT", f"applications/{app_id}", 200, update_data)
        if success:
            print(f"   Updated application: {data.get('title', 'Unknown')}")
        return success, data
    
    def test_get_stats(self):
        """Test getting dashboard statistics"""
        success, data = self.run_test("Get Stats", "GET", "stats", 200)
        if success:
            print(f"   Total applications: {data.get('total', 0)}")
            print(f"   Active applications: {data.get('active_applications', 0)}")
            print(f"   Recent (7 days): {data.get('recent_7_days', 0)}")
            # Check by_status breakdown
            by_status = data.get('by_status', {})
            if by_status:
                print("   Status breakdown:")
                for status, count in by_status.items():
                    print(f"     {status}: {count}")
        return success, data
    
    def test_create_alert(self):
        """Test creating an email alert"""
        alert_data = {
            "email": "test@example.com",
            "keywords": "Python, React",
            "job_type": "CDI",
            "location": "Paris",
            "salary_min": 45000,
            "frequency": "daily"
        }
        success, data = self.run_test("Create Alert", "POST", "alerts", 200, alert_data)
        if success:
            print(f"   Created alert with ID: {data.get('id')}")
            if data.get('id'):
                self.created_alerts.append(data['id'])
        return success, data
    
    def test_get_alerts(self):
        """Test getting all alerts"""
        success, data = self.run_test("Get Alerts", "GET", "alerts", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} alerts")
        return success, data
    
    def test_toggle_alert(self):
        """Test toggling alert active status"""
        if not self.created_alerts:
            print("⚠ No alert ID available - skipping test")
            return True, {}
        
        alert_id = self.created_alerts[0]
        success, data = self.run_test("Toggle Alert", "PATCH", f"alerts/{alert_id}/toggle", 200)
        if success:
            print(f"   Alert active status: {data.get('is_active')}")
        return success, data
    
    def test_delete_application(self):
        """Test deleting an application"""
        if not self.created_applications:
            print("⚠ No application ID available - skipping test")
            return True, {}
        
        app_id = self.created_applications[0]
        success, data = self.run_test("Delete Application", "DELETE", f"applications/{app_id}", 200)
        if success:
            print("   Application deleted successfully")
            self.created_applications.remove(app_id)
        return success, data
    
    def test_delete_alert(self):
        """Test deleting an alert"""
        if not self.created_alerts:
            print("⚠ No alert ID available - skipping test")
            return True, {}
        
        alert_id = self.created_alerts[0]
        success, data = self.run_test("Delete Alert", "DELETE", f"alerts/{alert_id}", 200)
        if success:
            print("   Alert deleted successfully")
            self.created_alerts.remove(alert_id)
        return success, data

def main():
    print("🚀 Starting Job Application Tracker API Tests")
    print("=" * 50)
    
    # Initialize tester
    tester = JobApplicationTrackerAPITester()
    
    # Run all tests in sequence
    print("\n📋 BASIC TESTS")
    tester.test_root_endpoint()
    
    print("\n📋 APPLICATION LISTING & FILTERING TESTS")
    tester.test_get_applications()
    tester.test_get_applications_with_status_filter()
    tester.test_get_applications_with_search()
    
    print("\n📋 APPLICATION CRUD TESTS")
    tester.test_create_application()
    tester.test_get_single_application()
    tester.test_get_application_not_found()
    tester.test_update_application_status()
    tester.test_update_application_full()
    
    print("\n📋 STATS TESTS")
    tester.test_get_stats()
    
    print("\n📋 ALERTS TESTS")
    tester.test_create_alert()
    tester.test_get_alerts()
    tester.test_toggle_alert()
    
    print("\n📋 CLEANUP TESTS")
    tester.test_delete_application()
    tester.test_delete_alert()
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            print(f"   • {failure}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())