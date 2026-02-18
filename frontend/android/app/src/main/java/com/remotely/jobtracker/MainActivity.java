package com.remotely.jobtracker;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleShareIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleShareIntent(intent);
    }

    private void handleShareIntent(Intent intent) {
        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && type != null) {
            if ("text/plain".equals(type)) {
                String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
                String sharedTitle = intent.getStringExtra(Intent.EXTRA_SUBJECT);
                
                if (sharedText != null) {
                    // Build the URL with shared data
                    StringBuilder url = new StringBuilder("/share?");
                    
                    if (sharedTitle != null) {
                        url.append("title=").append(android.net.Uri.encode(sharedTitle)).append("&");
                    }
                    
                    // Check if sharedText contains a URL
                    if (sharedText.contains("http://") || sharedText.contains("https://")) {
                        // Extract URL from text
                        String[] parts = sharedText.split("\\s+");
                        for (String part : parts) {
                            if (part.startsWith("http://") || part.startsWith("https://")) {
                                url.append("url=").append(android.net.Uri.encode(part)).append("&");
                                break;
                            }
                        }
                        url.append("text=").append(android.net.Uri.encode(sharedText));
                    } else {
                        url.append("text=").append(android.net.Uri.encode(sharedText));
                    }
                    
                    // Navigate to share page
                    this.bridge.getWebView().post(() -> {
                        this.bridge.getWebView().loadUrl("https://telework-finder.preview.emergentagent.com" + url.toString());
                    });
                }
            }
        }
    }
}
