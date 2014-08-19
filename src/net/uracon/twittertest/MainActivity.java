package net.uracon.twittertest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.CountDownLatch;

import net.reduls.sanmoku.Morpheme;
import net.reduls.sanmoku.Tagger;
import twitter4j.AsyncTwitter;
import twitter4j.AsyncTwitterFactory;
import twitter4j.HashtagEntity;
import twitter4j.IDs;
import twitter4j.PagableResponseList;
import twitter4j.ResponseList;
import twitter4j.Status;
import twitter4j.TwitterAdapter;
import twitter4j.TwitterException;
import twitter4j.TwitterListener;
import twitter4j.TwitterMethod;
import twitter4j.User;
import twitter4j.UserMentionEntity;
import twitter4j.auth.AccessToken;
import twitter4j.auth.OAuthAuthorization;
import twitter4j.auth.RequestToken;
import twitter4j.conf.Configuration;
import twitter4j.conf.ConfigurationContext;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.StrictMode;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

public class MainActivity extends Activity {

	public static final String OAUTH_CONSUMER = "KFDWuzu2BNfcx7CBJNBVQ";
	public static final String OAUTH_CONSUMER_SECRET = "pFAAuTePpnTQ0LNzQ2Y7dAZHUdj5qJ8hM9CytyQECXU";
	public static final String PREF_NAME = "twitter_access_token";
	public static final String PREF_KEY_TOKEN = "token";
	public static final String PREF_KEY_TOKEN_SECRET = "tokenSecret";

	private static OAuthAuthorization auth;
	private static RequestToken reqToken;

	private IDs playerFriendsIds;
	private ResponseList<Status> playerTimeline;
	private final Handler handler = new Handler();
	private final CountDownLatch playerFriendsIdsSignal = new CountDownLatch(1);
	private final CountDownLatch playerTimelineSignal = new CountDownLatch(1);

	private int neighborNum = 4;
	private int wordNeighborNum = 2;
	private LinkedList<Long> wordFriendIds = new LinkedList<Long>();
	private List<ResponseList<Status>> friendTimelines = new ArrayList<ResponseList<Status>>();
	private Friend heroine;
	private List<Friend> neighbors;
	private Friend player;

	public static void init(Context ctx) {
		StrictMode.setThreadPolicy(new StrictMode.ThreadPolicy.Builder()
				.permitAll().build());
		AccessToken accessToken = getAccessToken(ctx);
		if (accessToken != null) {
			ctx.startActivity(new Intent(ctx, MainActivity.class));
		} else {
			loginTwitter(ctx);
		}
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		getActionBar().hide();
		setContentView(R.layout.activity_main);
		AccessToken accessToken = getAccessToken(this);
		if (accessToken != null) {
			loadFriends(accessToken);
			return;
		}
		Intent intent = getIntent();
		Uri uri = intent.getData();
		if (uri != null
				&& uri.toString().startsWith(
						"net-uracon-twittertest://twittercallback")) {
			TwitterCallbackAsyncTask callbackTask = new TwitterCallbackAsyncTask(
					auth, reqToken) {
				@Override
				protected void onPostExecute(AccessToken result) {
					SharedPreferences sp = MainActivity.this
							.getSharedPreferences(PREF_NAME, MODE_PRIVATE);
					sp.edit()
							.putString(PREF_KEY_TOKEN, result.getToken())
							.putString(PREF_KEY_TOKEN_SECRET,
									result.getTokenSecret()).commit();
					loadFriends(result);
				}
			};
			callbackTask.execute(uri);
			return;
		}
	}

	private static AccessToken getAccessToken(Context ctx) {
//		SharedPreferences sp = ctx
//				.getSharedPreferences(PREF_NAME, MODE_PRIVATE);
//		String token = sp.getString(PREF_KEY_TOKEN, null);
//		String tokenSecret = sp.getString(PREF_KEY_TOKEN_SECRET, null);
//		if (token != null && tokenSecret != null) {
//			return new AccessToken(token, tokenSecret);
//		}
		return null;
	}

	private static void loginTwitter(Context ctx) {
		Configuration conf = ConfigurationContext.getInstance();
		auth = new OAuthAuthorization(conf);
		auth.setOAuthAccessToken(null);
		auth.setOAuthConsumer(OAUTH_CONSUMER, OAUTH_CONSUMER_SECRET);
		try {
			reqToken = auth
					.getOAuthRequestToken("net-uracon-twittertest://twittercallback");
			String url = reqToken.getAuthorizationURL();
			ctx.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
		} catch (TwitterException e) {
			e.printStackTrace();
		}
	}

	private void loadFriends(AccessToken accessToken) {
		AsyncTwitter twtr = AsyncTwitterFactory.getSingleton();
		twtr.setOAuthConsumer(OAUTH_CONSUMER, OAUTH_CONSUMER_SECRET);
		twtr.setOAuthAccessToken(accessToken);
		twtr.addListener(twitterListener);
		twtr.getFriendsList(accessToken.getUserId(), -1);
		twtr.verifyCredentials();
		twtr.getFriendsIDs(-1);
		twtr.getUserTimeline();
	}

	private AdapterView.OnItemClickListener onClick = new AdapterView.OnItemClickListener() {
		@Override
		public void onItemClick(AdapterView<?> parent, View view, int position,
				long id) {
			ListView listView = (ListView) parent;
			heroine = (Friend) listView.getItemAtPosition(position);
			AsyncTask<Friend, Void, Void> task = new AsyncTask<Friend, Void, Void>() {

				@Override
				protected Void doInBackground(Friend... params) {
					Friend friend = params[0];
					try {
						playerFriendsIdsSignal.await();
						AsyncTwitter twtr = AsyncTwitterFactory.getSingleton();
						twtr.getFriendsIDs(friend.id, -1);
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
					return null;
				}

			};
			task.execute(heroine);
		}
	};

	private TwitterListener twitterListener = new TwitterAdapter() {

		@Override
		public void verifiedCredentials(User user) {
			player = new Friend(user.getId(), user.getProfileImageURL(),
					user.getName(), user.getScreenName());
		}

		@Override
		public void gotFriendsList(PagableResponseList<User> users) {
			ArrayList<Friend> friends = new ArrayList<Friend>();
			for (User u : users) {
				friends.add(new Friend(u.getId(), u.getProfileImageURL(), u
						.getName(), u.getScreenName()));
			}
			final FriendArrayAdapter faa = new FriendArrayAdapter(
					MainActivity.this, R.layout.friend, friends, handler);
			handler.post(new Runnable() {
				@Override
				public void run() {
					ListView listView = (ListView) findViewById(R.id.listView1);
					listView.setAdapter(faa);
					listView.setOnItemClickListener(onClick);
				}
			});
		}

		@Override
		public void gotFriendsIDs(IDs ids) {
			if (playerFriendsIdsSignal.getCount() > 0) {
				playerFriendsIds = ids;
				playerFriendsIdsSignal.countDown();
			} else {
				try {
					playerTimelineSignal.await();
					Map<Long, Integer> neighborScore = new HashMap<Long, Integer>();
					for (long id : playerFriendsIds.getIDs()) {
						neighborScore.put(id, 0);
					}
					neighborScore.remove(heroine.id);
					for (long id : ids.getIDs()) {
						if (neighborScore.containsKey(id)) {
							neighborScore.put(id, 100);
						}
					}
					for (Status s : playerTimeline) {
						long inReplyToUserId = s.getInReplyToUserId();
						if (neighborScore.containsKey(inReplyToUserId)) {
							int score = neighborScore.get(inReplyToUserId);
							neighborScore.put(inReplyToUserId, score + 1);
						}
					}
					List<Entry<Long, Integer>> neighborScoreList = new ArrayList<Entry<Long, Integer>>(
							neighborScore.entrySet());
					Collections.sort(neighborScoreList,
							new Comparator<Entry<Long, Integer>>() {
								@Override
								public int compare(Entry<Long, Integer> lhs,
										Entry<Long, Integer> rhs) {
									return rhs.getValue() - lhs.getValue();
								}
							});
					long[] friendIds = new long[neighborNum];
					for (int i = 0; i < neighborNum; i++) {
						long neighborId = neighborScoreList.get(i).getKey();
						friendIds[i] = neighborId;
						if (i < wordNeighborNum) {
							wordFriendIds.add(neighborId);
						}
					}
					AsyncTwitter twtr = AsyncTwitterFactory.getSingleton();
					twtr.lookupUsers(friendIds);
					twtr.getUserTimeline(heroine.id);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
		}

		@Override
		public void lookedupUsers(ResponseList<User> users) {
			neighbors = new ArrayList<Friend>();
			for (User user : users) {
				neighbors.add(new Friend(user.getId(), user
						.getProfileImageURL(), user.getName(), user
						.getScreenName()));
			}
		}

		@Override
		public void gotUserTimeline(ResponseList<Status> statuses) {
			if (playerTimelineSignal.getCount() > 0) {
				playerTimeline = statuses;
				playerTimelineSignal.countDown();
			} else {
				friendTimelines.add(statuses);
				if (wordFriendIds.size() > 0) {
					AsyncTwitter twtr = AsyncTwitterFactory.getSingleton();
					twtr.getUserTimeline(wordFriendIds.poll());
				} else {
					player.words.addAll(calcWords(playerTimeline));
					Iterator<ResponseList<Status>> it = friendTimelines
							.iterator();
					ResponseList<Status> heroineTimeline = it.next();
					heroine.words.addAll(calcWords(heroineTimeline));
					for (Friend neighbor : neighbors) {
						if (it.hasNext())
							neighbor.words.addAll(calcWords(it.next()));
						else
							break;
					}
					handler.post(new Runnable() {
						@Override
						public void run() {
							FriendPickResult result = new FriendPickResult(
									player, heroine, neighbors);
							Intent data = new Intent(MainActivity.this,
									WebActivity.class);
							data.putExtra("result", result);
							startActivity(data);
							finish();
						}
					});
				}
			}
		}

		@Override
		public void onException(TwitterException te, TwitterMethod method) {
			te.printStackTrace();
		}
	};

	private List<String> calcWords(ResponseList<Status> timeline) {
		List<String> words = new ArrayList<String>();
		StringBuilder sb = new StringBuilder();
		for (Status s : timeline) {
			if (s.isRetweet())
				continue;
			String text = s.getText();
			text = text
					.replaceAll(
							"(https?)(:\\/\\/[-_.!~*\\'()a-zA-Z0-9;\\/?:\\@&=+\\$,%#]+)",
							"");
			for (UserMentionEntity ume : s.getUserMentionEntities()) {
				text = text.replace("@" + ume.getScreenName(), "");
			}
			for (HashtagEntity he : s.getHashtagEntities()) {
				text = text.replace("#" + he.getText(), "");
			}
			sb.append(text);
			sb.append("。");
		}
		for (Morpheme m : Tagger.parse(sb.toString())) {
			if (m.feature.startsWith("名詞") && !m.feature.startsWith("名詞,数")
					&& m.surface.length() > 1)
				words.add(m.surface);
		}
		return words;
	}

	// private void setDummyList() {
	// ArrayList<Friend> friends = new ArrayList<Friend>();
	// friends.add(new Friend(
	// "https://pbs.twimg.com/profile_images/1610656772/nTotani.jpg",
	// "ntotani（ロックンロールでない）", "@blankblnk"));
	// friends.add(new Friend(
	// "https://pbs.twimg.com/profile_images/1713480924/SakeRice_image.jpg",
	// "さけらいす@概念的三刀流", "@SakeRice"));
	// friends.add(new Friend(
	// "https://pbs.twimg.com/profile_images/428898916/buzzttan_silhouette.png",
	// "buzztter", "@buzztter"));
	// friends.add(new Friend(
	// "https://pbs.twimg.com/profile_images/378800000405911291/7b6fd24306e7517bbc03d3b924b24b9a.png",
	// "bombtter", "@bombtter"));
	// friends.add(new Friend(
	// "https://pbs.twimg.com/profile_images/714540626/_____73.gif",
	// "診断メーカー", "@shindanmaker"));
	// friends.add(new Friend(
	// "https://pbs.twimg.com/profile_images/2120936430/wakatter_zoom.jpg",
	// "わかったー", "@wakatter"));
	// friends.add(new Friend(
	// "https://pbs.twimg.com/profile_images/378800000215614659/863e26309a5c790ee3431b90ff1137b2.png",
	// "togetter_jp", "@togetter_jp"));
	// friends.add(new Friend(
	// "https://pbs.twimg.com/profile_images/485555071/3241768349_515d90dc5a_o.jpg",
	// "ツイッター ニュース", "@tw_news_jp"));
	// FriendArrayAdapter faa = new FriendArrayAdapter(this, R.layout.friend,
	// friends);
	// ArrayAdapter<String> arr = new ArrayAdapter<String>(this,
	// android.R.layout.simple_list_item_activated_1, new String[] {
	// "hoge", "foo", "bar", "piyo", "aaa", "hoge", "foo",
	// "bar", "piyo", "aaa" });
	// ListView listView = (ListView) findViewById(R.id.listView1);
	// listView.setAdapter(faa);
	// listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
	//
	// @Override
	// public void onItemClick(AdapterView<?> parent, View view,
	// int position, long id) {
	// ListView listView = (ListView) parent;
	// Friend friend = (Friend) listView.getItemAtPosition(position);
	// Intent data = new Intent(MainActivity.this, WebActivity.class);
	// data.putExtra("name", friend.getName());
	// // setResult(RESULT_OK, data);
	// // finish();
	// startActivity(data);
	// finish();
	// }
	//
	// });
	// }

}
