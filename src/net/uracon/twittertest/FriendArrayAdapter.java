package net.uracon.twittertest;

import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

public class FriendArrayAdapter extends ArrayAdapter<Friend> {

	private LayoutInflater layoutInflater;
	private Handler handler;
	private Map<Long, Bitmap> icons = new HashMap<Long, Bitmap>();

	public FriendArrayAdapter(Context context, int resource,
			List<Friend> objects, Handler handler) {
		super(context, resource, objects);
		layoutInflater = (LayoutInflater) context
				.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
		this.handler = handler;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		final Friend friend = (Friend) getItem(position);
		if (convertView == null) {
			convertView = layoutInflater.inflate(R.layout.friend, null);
		}
		TextView name = (TextView) convertView.findViewById(R.id.name);
		name.setText(friend.name);
		TextView subName = (TextView) convertView.findViewById(R.id.sub_name);
		subName.setText(friend.subName);
		final ImageView icon = (ImageView) convertView.findViewById(R.id.icon);
		if (icons.containsKey(friend.id)) {
			icon.setImageBitmap(icons.get(friend.id));
		} else {
			AsyncTask<String, Integer, Bitmap> task = new AsyncTask<String, Integer, Bitmap>() {

				@Override
				protected Bitmap doInBackground(String... params) {
					try {
						URL imageUrl = new URL(params[0]);
						return BitmapFactory
								.decodeStream(imageUrl.openStream());
					} catch (Exception e) {
						return null;
					}
				}

				@Override
				protected void onPostExecute(final Bitmap result) {
					if (result != null) {
						icons.put(friend.id, result);
						handler.post(new Runnable() {
							@Override
							public void run() {
								icon.setImageBitmap(result);
							}
						});
					}
				}

			};
			task.execute(friend.iconUrl);
		}
		return convertView;
	}

}
