import requests
import sys
import json
from datetime import datetime

class RemoteJobAPITester:
    def __init__(self, base_url="https://telework-finder.preview.emergentagent.com"):
        self.base_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
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
                response = requests.patch(url, json=data, headers=headers)
                
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
    
    def test_jobs_listing(self):
        """Test job listings without filters"""
        success, data = self.run_test("Jobs Listing", "GET", "jobs", 200)
        if success:
            print(f"   Found {data.get('total', 0)} jobs")
            if data.get('total', 0) >= 12:
                print("   ✓ Has expected 12+ mock jobs")
            else:
                print(f"   ⚠ Expected 12 jobs, found {data.get('total', 0)}")
        return success, data
    
    def test_jobs_search_react(self):
        """Test job search with 'React' keyword"""
        params = {"query": "React"}
        success, data = self.run_test("Jobs Search - React", "GET", "jobs", 200, params=params)
        if success:
            jobs = data.get('jobs', [])
            print(f"   Found {len(jobs)} React jobs")
            # Verify results contain React-related jobs
            react_found = any(
                'react' in job.get('title', '').lower() or 
                'react' in job.get('description', '').lower() or
                any('react' in tag.lower() for tag in job.get('tags', []))
                for job in jobs
            )
            if react_found:
                print("   ✓ Contains React-related jobs")
            else:
                print("   ⚠ No React-related jobs found")
        return success, data
    
    def test_jobs_filter_by_type(self):
        """Test job filtering by type (CDI)"""
        params = {"job_type": "CDI"}
        success, data = self.run_test("Jobs Filter - CDI", "GET", "jobs", 200, params=params)
        if success:
            jobs = data.get('jobs', [])
            print(f"   Found {len(jobs)} CDI jobs")
            # Verify all results are CDI
            all_cdi = all(job.get('job_type') == 'CDI' for job in jobs)
            if all_cdi:
                print("   ✓ All results are CDI jobs")
            else:
                print("   ⚠ Some results are not CDI jobs")
        return success, data
    
    def test_jobs_filter_by_location(self):
        """Test job filtering by location (France)"""
        params = {"location": "France"}
        success, data = self.run_test("Jobs Filter - France", "GET", "jobs", 200, params=params)
        if success:
            jobs = data.get('jobs', [])
            print(f"   Found {len(jobs)} jobs in France")
        return success, data
    
    def test_jobs_filter_by_salary(self):
        """Test job filtering by minimum salary"""
        params = {"salary_min": 50000}
        success, data = self.run_test("Jobs Filter - Salary 50k+", "GET", "jobs", 200, params=params)
        if success:
            jobs = data.get('jobs', [])
            print(f"   Found {len(jobs)} jobs with 50k+ salary")
            # Verify salary filtering
            valid_salaries = all(
                job.get('salary_min', 0) >= 50000 
                for job in jobs 
                if job.get('salary_min')
            )
            if valid_salaries:
                print("   ✓ All results meet salary requirement")
        return success, data
    
    def test_get_job_detail(self):
        """Test getting specific job details"""
        # Use job ID "1" from mock data
        success, data = self.run_test("Get Job Detail", "GET", "jobs/1", 200)
        if success:
            print(f"   Job: {data.get('title', 'Unknown')}")
            print(f"   Company: {data.get('company', 'Unknown')}")
        return success, data
    
    def test_get_job_not_found(self):
        """Test getting non-existent job"""
        return self.run_test("Get Job Not Found", "GET", "jobs/999", 404)
    
    def test_create_favorite(self):
        """Test adding a job to favorites"""
        favorite_data = {
            "job_id": "test-job-1",
            "job_title": "Test Developer",
            "company": "Test Company",
            "location": "France (Remote)",
            "job_type": "CDI",
            "salary_min": 45000,
            "salary_max": 65000,
            "apply_url": "https://example.com/apply"
        }
        success, data = self.run_test("Create Favorite", "POST", "favorites", 200, favorite_data)
        if success:
            print(f"   Created favorite with ID: {data.get('id')}")
            # Store the favorite ID for cleanup
            if hasattr(self, 'created_favorites'):
                self.created_favorites.append(data.get('job_id'))
            else:
                self.created_favorites = [data.get('job_id')]
        return success, data
    
    def test_get_favorites(self):
        """Test getting all favorites"""
        success, data = self.run_test("Get Favorites", "GET", "favorites", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} favorites")
        return success, data
    
    def test_delete_favorite(self):
        """Test removing a job from favorites"""
        # Delete the test favorite we created
        job_id = "test-job-1"
        return self.run_test("Delete Favorite", "DELETE", f"favorites/{job_id}", 200)
    
    def test_create_alert(self):
        """Test creating an email alert"""
        alert_data = {
            "email": "test@example.com",
            "keywords": "Python, FastAPI",
            "job_type": "CDI",
            "location": "France",
            "salary_min": 45000,
            "frequency": "daily"
        }
        success, data = self.run_test("Create Alert", "POST", "alerts", 200, alert_data)
        if success:
            print(f"   Created alert with ID: {data.get('id')}")
            # Store the alert ID for cleanup
            if hasattr(self, 'created_alerts'):
                self.created_alerts.append(data.get('id'))
            else:
                self.created_alerts = [data.get('id')]
        return success, data
    
    def test_get_alerts(self):
        """Test getting all alerts"""
        success, data = self.run_test("Get Alerts", "GET", "alerts", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} alerts")
        return success, data
    
    def test_toggle_alert(self):
        """Test toggling alert active status"""
        if hasattr(self, 'created_alerts') and self.created_alerts:
            alert_id = self.created_alerts[0]
            return self.run_test("Toggle Alert", "PATCH", f"alerts/{alert_id}/toggle", 200)
        else:
            print("⚠ No alert to toggle - skipping test")
            return True, {}
    
    def test_delete_alert(self):
        """Test deleting an alert"""
        if hasattr(self, 'created_alerts') and self.created_alerts:
            alert_id = self.created_alerts[0]
            return self.run_test("Delete Alert", "DELETE", f"alerts/{alert_id}", 200)
        else:
            print("⚠ No alert to delete - skipping test")
            return True, {}
    
    def test_stats_endpoint(self):
        """Test getting dashboard statistics"""
        success, data = self.run_test("Get Stats", "GET", "stats", 200)
        if success:
            print(f"   Total jobs: {data.get('total_jobs', 0)}")
            print(f"   Favorites count: {data.get('favorites_count', 0)}")
            print(f"   Active alerts: {data.get('active_alerts', 0)}")
        return success, data

def main():
    print("🚀 Starting Remote Job Search API Tests")
    print("=" * 50)
    
    # Initialize tester
    tester = RemoteJobAPITester()
    
    # Run all tests in sequence
    print("\n📋 BASIC TESTS")
    tester.test_root_endpoint()
    
    print("\n📋 JOB LISTING & SEARCH TESTS")
    tester.test_jobs_listing()
    tester.test_jobs_search_react()
    tester.test_jobs_filter_by_type()
    tester.test_jobs_filter_by_location()
    tester.test_jobs_filter_by_salary()
    
    print("\n📋 JOB DETAIL TESTS")
    tester.test_get_job_detail()
    tester.test_get_job_not_found()
    
    print("\n📋 FAVORITES TESTS")
    tester.test_create_favorite()
    tester.test_get_favorites()
    tester.test_delete_favorite()
    
    print("\n📋 ALERTS TESTS")
    tester.test_create_alert()
    tester.test_get_alerts()
    tester.test_toggle_alert()
    tester.test_delete_alert()
    
    print("\n📋 STATS TESTS")
    tester.test_stats_endpoint()
    
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