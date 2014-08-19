Array.prototype.shuffle = function() {
  var i = this.length;
  while(i){
    var j = Math.floor(Math.random()*i);
    var t = this[--i];
    this[i] = this[j];
    this[j] = t;
  }
  return this;
}

Job = {
  Pla: 0,
  Ike: 1,
  Kaz: 2,
  Mor: 3,
  Pie: 4,
  names: ["勇者", "イケメン", "数合わせ", "盛り上げ役", "自由人"]
}

Boy = enchant.Class.create({
  initialize: function(name, job) {
    this.name = name;
    this.job = job;
    this.love = -1;
    this.attack = Boy.def.attack[job];
    this.exist = true;
  }
});

Boy.def = {
  attack: [10, 15, 8, 10, 10],
  ikeLieRevealProb: [0.8, 0.2],
  kazTalkLieRevealProb: [0.7, 0.2, 0.1],
  pieProb: [0.5, 0.1, 0.3, 0.1]
}

Girl = enchant.Class.create({
  initialize: function(name, char) {
    this.name = name;
    this.char = char;
    this.tension = Girl.def.tension;
    var like = Girl.def.like;
    this.like = [like, like, like];
    this.lie = [0, 0, 0];
    this.goHome = Girl.def.goHome;
    this.love = -1;
    this.loveArea = Girl.def.loveArea;
    this.exist = true;
  }, loveProb: function(boy) {
    return (this.like[boy] - this.loveArea) / (100.0 - this.loveArea);
  }, gohomeProb: function() {
    return 1.0 - 1.0 * this.tension / this.goHome;
  }, tryRelease: function(boys) {
    var prob = 1.0 - this.loveProb(this.love);
    if(Math.random() < prob) {
      boys[this.love].love = -1;
      this.love = -1;
      return true;
    }
    return false;
  }, getMessage: function() {
    if(this.love != -1)
      return [this.name + " はイチャイチャしている"];
    if(this.tension <= this.goHome)
      return [this.name + " はつまらなさそうにしている"];
    if(Math.max.apply(null, this.like) >= this.loveArea)
      return [this.name + " はウットリしている"];
    if(this.tension >= this.loveArea)
      return [this.name + " は楽しそうにしている"];
    return [this.name + " は様子を窺っている"];
  }
});

Girl.def = {
  tension: 50,
  like: 50,
  goHome: 20,
  loveArea: 80
}

Topic = enchant.Class.create({
  initialize: function(text, girlIndex) {
    this.text = text;
    this.girlIndex = girlIndex;
  }
});

ActType = {
  Talk: 0,
  Propose: 1,
  Lie: 2,
  Reveal: 3,
  Release: 4,
  Steal: 5,
  Love: 6,
  Gohome: 7,
  Evolve: 8
}

ActResult = enchant.Class.create({
  initialize: function(from, to, type, success) {
    this.from = from;
    this.to = to;
    this.type = type;
    this.success = success;
  }
});

ActResultTalk = enchant.Class.create(ActResult, {
  initialize: function(from, to, topic, success) {
    ActResult.call(this, from, to, ActType.Talk, success);
    this.topic = topic;
  }, getMessage: function(engine) {
    var boy = engine.boys[this.from].name;
    var girl = engine.girls[this.to].name;
    return [boy + " は " + this.topic.text + " について話した",
        girl + (this.success ? " はウケた" : this.topic.girlIndex == 2 ? " は冷たい目でこちらを見ている" : " は聞いていない")];
  }
});

ActResultPropose = enchant.Class.create(ActResult, {
  initialize: function(from, to, success) {
    ActResult.call(this, from, to, ActType.Propose, success);
  }, getMessage: function(engine) {
    return [engine.boys[this.from].name + " は " + engine.girls[this.to].name + " を口説いた",
    engine.girls[this.to].name + (this.success ? " はメロメロになった" : "「え，そういうのはちょっと^^;」")];
  }
});

ActResultLie = enchant.Class.create(ActResult, {
  initialize: function(from, to, topic) {
    ActResult.call(this, from, to, ActType.Lie, true);
    this.topic = topic;
  }, getMessage: function(engine) {
    return [engine.boys[this.from].name + " は " + this.topic.text + " について話した",
        engine.girls[this.to].name + " はウケた"];
  }
});

ActResultReveal = enchant.Class.create(ActResult, {
  initialize: function(from, to, out) {
    ActResult.call(this, from, to, ActType.Reveal, from != out);
    this.out = out;
  }, getMessage: function(engine) {
    var ret = [engine.boys[this.from].name + " は仲間を売った"];
    if(this.success) {
      ret.push(engine.girls[this.to].name + "「嘘ついてたんですか！？」");
      ret.push(engine.boys[this.out].name + " は目が泳いでいる");
    } else {
      ret.push(engine.girls[this.to].name + "「そういうことするんですね…」");
      ret.push(engine.boys[this.from].name + "は立場が悪くなった");
    }
    return ret;
  }
});

ActResultRelease = enchant.Class.create(ActResult, {
  initialize: function(from, to, love, success) {
    ActResult.call(this, from, to, ActType.Release, success);
    this.love = love;
  }, getMessage: function(engine) {
    return [engine.boys[this.from].name + " は " + engine.boys[this.love].name + " の恋を邪魔した",
      engine.girls[this.to].name + (this.success ? " の熱は冷めた" : " は周りが見えていない")];
  }
});

ActResultSteal = enchant.Class.create(ActResult, {
  initialize: function(from, to, love, out) {
    ActResult.call(this, from, to, ActType.Steal, love == out);
    this.love = love;
    this.out = out;
  }, getMessage: function(engine) {
    if(this.out == this.love)
      return [engine.boys[this.from].name + " は " + engine.boys[this.out].name + " の秘密をバラした",
      engine.boys[this.out].name + " の信用は地に落ちた",
      engine.girls[this.to].name + " は " + engine.boys[this.from].name + " に乗り換えた"]
    else if(this.out == this.from)
      return [engine.boys[this.from].name + " は " + engine.boys[this.love].name + "の恋を邪魔した",
      engine.girls[this.to].name + "（………うぜえ）",
      engine.boys[this.from].name + " はとても嫌われた"];
    return [engine.boys[this.from].name + " は邪魔をした",
    engine.girls[this.to].name + " は聞いていない"]
  }
});

ActResultLove = enchant.Class.create(ActResult, {
  initialize: function(from, to, success) {
    ActResult.call(this, from, to, ActType.Love, success);
  }, getMessage: function(engine) {
    if(this.success)
      return [engine.boys[this.from].name + " は",
          engine.girls[this.to].name + " を", "お持ち帰りした"];
    return [engine.boys[this.from].name + " は " + engine.girls[this.to].name + " を",
        "持ち帰ろうとしている"];
  }
});

ActResultGohome = enchant.Class.create({
  initialize: function(girlIndex) {
    this.to = girlIndex;
    this.type = ActType.Gohome;
  }, getMessage: function(engine) {
    return [engine.girls[this.to].name + " は",
    "急用を思い出して帰った"];
  }
});

ActResultNoGirl = enchant.Class.create({
  initialize: function(from, to) {
    this.from = from;
    this.to = to;
  }, getMessage: function(engine) {
    return [engine.boys[this.from].name + " は",
        "いなくなった " + engine.girls[this.to].name + " に",
        "固執している"];
  }
});