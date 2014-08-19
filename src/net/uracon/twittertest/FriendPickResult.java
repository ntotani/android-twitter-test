package net.uracon.twittertest;

import java.io.Serializable;
import java.util.List;

public class FriendPickResult implements Serializable {

	private static final long serialVersionUID = 1L;

	public final Friend player, heroine;
	public final List<Friend> neighbors;

	public FriendPickResult(Friend player, Friend heroine,
			List<Friend> neighbors) {
		this.player = player;
		this.heroine = heroine;
		this.neighbors = neighbors;
	}

}