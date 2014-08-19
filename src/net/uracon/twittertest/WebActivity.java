package net.uracon.twittertest;

import java.io.Serializable;

import net.arnx.jsonic.JSON;
import net.nend.android.NendAdView;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.ConsoleMessage;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

public class WebActivity extends Activity {

	@SuppressLint("SetJavaScriptEnabled")
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		getActionBar().hide();
		setContentView(R.layout.activity_web);
		WebView webView = (WebView) findViewById(R.id.webView1);
		webView.setWebViewClient(new WebViewClient() {
			@Override
			public boolean shouldOverrideUrlLoading(WebView view, String url) {
				if (url.startsWith("login:///")) {
					MainActivity.init(WebActivity.this);
					return true;
				} else if (url.startsWith("camera:///")) {
					screenShot();
					return true;
				}
				return super.shouldOverrideUrlLoading(view, url);
			}
		});
		webView.setWebChromeClient(new WebChromeClient() {
			@Override
			public boolean onJsAlert(WebView view, String url, String message,
					JsResult result) {
				Toast.makeText(WebActivity.this, message, Toast.LENGTH_SHORT)
						.show();
				Log.d("onJsAlert", url + ", " + message);
				result.confirm();
				// return super.onJsAlert(view, url, message, result);
				return true;
			}

			@Override
			public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
				String tag = "onConsoleMessage";
				String msg = consoleMessage.message() + ", "
						+ consoleMessage.sourceId() + ", "
						+ consoleMessage.lineNumber();
				switch (consoleMessage.messageLevel()) {
				case ERROR:
					Log.e(tag, msg);
					break;
				case WARNING:
					Log.w(tag, msg);
					break;
				case DEBUG:
				case LOG:
				case TIP:
					Log.d(tag, msg);
					break;
				}
				return true;
			}
		});
		WebSettings setting = webView.getSettings();
		setting.setJavaScriptEnabled(true);
		setting.setUseWideViewPort(true);
		setting.setLoadWithOverviewMode(true);
		webView.clearCache(true);
		webView.setInitialScale(1);
		webView.loadUrl("file:///android_asset/war/game.html");
		initAd();
	}

	private void initAd() {
		NendAdView adView = new NendAdView(getApplicationContext(), 113479,
				"440e643fad6881a167d10aeefe8722af99a39334");
		// NendAdView adView = new NendAdView(getApplicationContext(), 3174,
		// "c5cb8bc474345961c6e7a9778c947957ed8e1e4f");
		int wc = FrameLayout.LayoutParams.WRAP_CONTENT;
		FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(wc, wc);
		params.gravity = (Gravity.BOTTOM | Gravity.CENTER);
		addContentView(adView, params);
		adView.loadAd();
	}

	private void screenShot() {
		WebView webView = (WebView) findViewById(R.id.webView1);
		webView.setDrawingCacheEnabled(true);
		Bitmap cache = webView.getDrawingCache();
		if (cache != null) {
			cache = Bitmap.createBitmap(cache);
			ShareActivity.ss = cache;
			startActivity(new Intent(this, ShareActivity.class));
			// ByteArrayOutputStream bos = new ByteArrayOutputStream();
			// cache.compress(CompressFormat.PNG, 0, bos);
			// StatusUpdate status = new StatusUpdate("hoge");
			// status.media("ss", new ByteArrayInputStream(bos.toByteArray()));
			// AsyncTwitter twtr = AsyncTwitterFactory.getSingleton();
			// twtr.updateStatus(status);
		}
		webView.setDrawingCacheEnabled(false);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.web, menu);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		return super.onOptionsItemSelected(item);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (requestCode == 1 && resultCode == RESULT_OK) {
			// String name = data.getCharSequenceExtra("name").toString();
			// // String url = String.format("javascript:alert('%s')", name);
			// String url = String.format("javascript:onFriendsLoad('%s')",
			// name);
			// WebView webView = (WebView) findViewById(R.id.webView1);
			// webView.loadUrl(url);
			FriendPickResult fpr = (FriendPickResult) data
					.getSerializableExtra("result");
			Log.d("hoge", fpr.player.name);
		}
		Log.d("hoge", "onActivityResult: " + requestCode + ", " + resultCode);
	}

	@Override
	protected void onNewIntent(Intent intent) {
		Serializable extra = intent.getSerializableExtra("result");
		if (extra != null) {
			FriendPickResult fpr = (FriendPickResult) extra;
			String json = JSON.encode(fpr);
			String url = "javascript:onFriendsLoad(" + json + ")";
			WebView webView = (WebView) findViewById(R.id.webView1);
			webView.loadUrl(url);
		}
	}

}