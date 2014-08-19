GcqEngineFactoryTw = {
  setFriendJob: function(joba, jobb) {
    this.joba = joba;
    this.jobb = jobb;
  }, createEngine: function() {
    var boys = [
        new Boy("@" + this.boysName[0].substr(0, 12), Job.Pla),
        new Boy("@" + this.boysName[1].substr(0, 12), this.joba),
        new Boy("@" + this.boysName[2].substr(0, 12), this.jobb)];
    var girlsName = this.girlsName;
    var girls = ["スライみゅ", "ドラぴぃ", "スライみん",
        "ゴースたん", "ドラちぃ", "サソりんりん", "ガイコちゅ",
        "まじょっこ"].map(function(e, i, arr) {
      return { "name":e, "char":i };
    }).shuffle().slice(0, 2).concat([{ "name":"ゴリ子", "char":9 }]).map(function(e, i, arr) {
      return new Girl("@" + girlsName[i].substr(0, 12), e.char);
    });
    var engine = new Engine(boys, girls, this.topics);
    return engine;
  }, friendsBoy: {}, friendsGirlA: [], topics: [],
  
  waitLoad: function() {
    if(this.friendsBoyLoaded && this.managerGirl) {
      delete this.friendsBoy[this.managerGirl];
      this.callbackAddFriend = function(friend) {
        GcqEngineFactory.friendsGirlA.push(friend);
      }
      this.callbackLoadedFriend = function() {
        GcqEngineFactory.friendsGirlALoaded = true;
      }
      GcqEngineFactory.waitLoad = GcqEngineFactory.waitLoad2;
      this.getStatuses(this.player);
      this.who = this.managerGirl;
      this.getFriends({"next_cursor" : -1, "users" : []});
    }
  },
  
  waitLoad2: function() {
    if(this.StatusesBoyLoaded && this.friendsGirlALoaded) {
      this.friendsGirlA.forEach(function(e) {
        if(GcqEngineFactory.friendsBoy.hasOwnProperty(e))
          GcqEngineFactory.friendsBoy[e] += 100;
      });
      var member = [];
      for(var f in this.friendsBoy)
        member.push({"name":f, "score":this.friendsBoy[f]});
      member.shuffle().sort(function(a, b) {
        return b.score - a.score;
      });
      this.girlsName = [this.managerGirl, member[1].name, member[0].name];
      this.boysName = [this.player, member[2].name, member[3].name];
      this.onGetStatuses = function(json) {
        this.getNouns(json.map(function(e){return e.text}).join("。"));
      }
      this.setTopics(0);
      GcqEngineFactory.waitLoad = function(){}
    }
  },
  
  setTopics: function(i) {
    this.onGetNouns = function(nouns) {
      nouns.forEach(function(e) {
        GcqEngineFactory.topics.push(new Topic(e, i));
      });
      if(i == 2)
        GcqEngineFactory.topicsLoaded = true;
      else
        GcqEngineFactory.setTopics(i + 1);
    }
    this.getStatuses(this.girlsName[i]);
  },
  
  callbackAddFriend: function(friend) {
    GcqEngineFactory.friendsBoy[friend] = 0;
    if(enchant.Game.instance.currentScene.addFriend)
      enchant.Game.instance.currentScene.addFriend(friend);
  },
  
  callbackLoadedFriend: function() {
    GcqEngineFactory.friendsBoyLoaded = true;
  },
  
  getFriends: function(json) {
    var cursor = json["next_cursor"];
    for (var i = 0; i < json["users"].length; i++)
      if(!json["users"][i]["protected"])
        GcqEngineFactory.callbackAddFriend(json["users"][i]["screen_name"]);
    if (cursor != 0) {
      var elem = document.createElement("script");
      elem["src"] = "http://api.twitter.com/1/statuses/friends.json?screen_name=" + this.who + "&callback=GcqEngineFactory.getFriends&cursor=" + cursor;
      document.body.appendChild(elem);
    } else
      GcqEngineFactory.callbackLoadedFriend();
  },
  
  onGetNouns: function(nouns) {
  },
  
  getNouns: function(text) {
    if(document["YahooJLPMAS"].execute)
      document["YahooJLPMAS"].execute(text, "GcqEngineFactory.onGetNouns");
    else
      $.post("getNouns", {"text":text}, GcqEngineFactory.onGetNouns, "json");
  },
  
  onGetStatuses: function(json) {
    var joined = json.map(function(e){return e.text}).join("。");
    joined.match(/@[a-zA-Z0-9_]+/g).forEach(function(e) {
      var id = e.substr(1);
      if(GcqEngineFactory.friendsBoy.hasOwnProperty(id))
        GcqEngineFactory.friendsBoy[id] += 1;
    });
    this.StatusesBoyLoaded = true;
  },
  
  getStatuses: function(name) {
    var elem = document.createElement("script");
    elem["src"] = "http://api.twitter.com/1/statuses/user_timeline.json?callback=GcqEngineFactory.onGetStatuses&screen_name=" + name;
    document.body.appendChild(elem);
  }
};
