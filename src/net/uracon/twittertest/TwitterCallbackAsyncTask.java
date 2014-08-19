package net.uracon.twittertest;

import twitter4j.TwitterException;
import twitter4j.auth.AccessToken;
import twitter4j.auth.OAuthAuthorization;
import twitter4j.auth.RequestToken;
import android.net.Uri;
import android.os.AsyncTask;
import android.util.Log;

public class TwitterCallbackAsyncTask extends
		AsyncTask<Uri, Integer, AccessToken> {

	private OAuthAuthorization auth;
	private RequestToken reqToken;

	public TwitterCallbackAsyncTask(OAuthAuthorization auth,
			RequestToken reqToken) {
		this.auth = auth;
		this.reqToken = reqToken;
	}

	@Override
	protected AccessToken doInBackground(Uri... params) {
		Uri callbackUri = params[0];
		AccessToken accToken = null;
		String verifier = callbackUri.getQueryParameter("oauth_verifier");
		try {
			accToken = auth.getOAuthAccessToken(reqToken, verifier);
		} catch (TwitterException e) {
			Log.v("ERR", "callback err:" + e.getMessage());
			return null;
		}
		return accToken;
	}
}