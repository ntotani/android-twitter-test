package net.uracon.twittertest;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Friend implements Serializable {

	private static final long serialVersionUID = 1L;

	public final long id;
	public final String iconUrl;
	public final String name;
	public final String subName;
	public final List<String> words = new ArrayList<String>();

	public Friend(long id, String iconUrl, String name, String subName) {
		this.id = id;
		this.iconUrl = iconUrl;
		this.name = name;
		this.subName = subName;
	}

}
