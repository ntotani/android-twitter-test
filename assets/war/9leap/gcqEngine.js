Engine = enchant.Class.create({
  initialize: function(boys, girls, topics) {
    this.turn = 0;
    this.boys = boys;
    this.girls = girls;
    this.topicsPool = topics;
    this.refleshTopics();
  },
  
  refleshTopics: function() {
    this.topics = this.topicsPool.concat().shuffle().splice(0, 4);
  },
  
  executePlayer: function(act, to, topic) {
    this.turn += 1;
    if(!this.girls[to].exist)
      return this.executeComs([new ActResultNoGirl(0, to)]);
    switch(act) {
      case ActType.Talk:
        return this.executeComs([this.talk(0, to, topic)]);
      case ActType.Propose:
        return this.executeComs([this.propose(0, to)]);
      case ActType.Lie:
        return this.executeComs([this.lie(0, to, topic)]);
      case ActType.Reveal:
        return this.executeComs([this.reveal(0, to)]);
    }
  },
  
  executeLove: function(ret) {
    this.turn += 1;
    ret.push(this.love(0));
    return this.executeComs(ret);
  },
  
  executeComs: function(ret) {
    if(!this.boys[0].exist)
      return ret;
    var boy = function(i) {
      if(this.boys[i].exist)
        if(this.boys[i].love != -1)
          ret.push(this.love(i));
        else
          ret.push(this.executeFriend(i));
    }
    boy.apply(this, [1]);
    if(this.girls.every(function(e) { return !e.exist }))
      return ret;
    boy.apply(this, [2]);
    this.girls.forEach(function(e, i, arr) {
      if(e.exist) {
        if(e.love == -1 && Math.random() < e.gohomeProb()) {
          e.exist = false;
          ret.push(new ActResultGohome(i));
        } else
          ret.push(e);
      }
    });
    if(this.boys[0].love != -1)
      this.executeLove(ret);
    return ret;
  },
  
  talk: function(from, to, topic) {
    var girl = this.girls[to];
    if(girl.love == -1) {
      if(topic.girlIndex == to) {
        girl.like[from] += this.boys[from].attack;
        girl.tension += this.boys[from].attack;
        return new ActResultTalk(from, to, topic, true);
      } else {
        girl.tension -= this.boys[from].attack;
        return new ActResultTalk(from, to, topic, false);
      }
    }
    var love = girl.love;
    var ret = girl.tryRelease(this.boys);
    return new ActResultRelease(from, to, love, ret);
  },
  
  propose: function(from, to) {
    var girl = this.girls[to];
    if(girl.love == -1) {
      var prob = girl.loveProb(from);
      if(0 <= prob) {
        this.boys[from].love = to;
        girl.love = from;
        girl.like[from] += (100.0 - girl.loveArea) / 10;
        return new ActResultPropose(from, to, true);
      }
      girl.like[from] -= this.boys[from].attack;
      girl.tension -= this.boys[from].attack;
      return new ActResultPropose(from, to, false);
    }
    var love = girl.love;
    var ret = girl.tryRelease(this.boys);
    return new ActResultRelease(from, to, love, ret);
  },
  
  lie: function(from, to, topic) {
    var girl = this.girls[to];
    if(girl.love == -1) { 
      girl.like[from] += this.boys[from].attack;
      girl.lie[from] += this.boys[from].attack;
      return new ActResultLie(from, to, topic);
    }
    var love = girl.love;
    var ret = girl.tryRelease(this.boys);
    return new ActResultRelease(from, to, love, ret);
  },
  
  reveal: function(from, to) {
    var girl = this.girls[to];
    var out = girl.lie.map(function(e, i, arr) {
      return {"score": e, "index": i}
    }).sort(function(a, b){
      if(a.score == b.score) {
        if(a.index == from) return -1;
        return 1;
      }
      return b.score - a.score
    })[0].index;
    if(girl.love == -1) {
      if(out == from) {
        girl.like[from] -= this.boys[from].attack;
        girl.tension -= this.boys[from].attack;
      } else {
        girl.like[out] -= girl.lie[out] * 2;
        girl.lie[out] = 0;
      }
      return new ActResultReveal(from, to, out);
    }
    var love = girl.love;
    if(out == love) {
      girl.like[out] = 0;
      girl.lie[out] = 0;
      this.boys[out].love = -1;
      girl.love = from;
      this.boys[from].love = to;
      girl.like[from] = Math.max(girl.like[from], girl.loveArea);
    } else if(out == from) {
      girl.like[from] -= this.boys[from].attack * 2;
      girl.lie[from] -= this.boys[from].attack * 2;
    }
    return new ActResultSteal(from, to, love, out);
  },
  
  love: function(from) {
    var boy = this.boys[from];
    var girl = this.girls[boy.love];
    girl.like[from] += (100 - girl.loveArea) / 5;
    if(Math.random() < girl.loveProb(from)) {
      boy.exist = false;
      girl.exist = false;
      return new ActResultLove(from, boy.love, true);
    }
    return new ActResultLove(from, boy.love, false);
  },
  
  executeFriend: function(friend) {
    switch(this.boys[friend].job) {
      case Job.Ike:
        return this.executeFriendIke(friend);
      case Job.Kaz:
        return this.executeFriendKaz(friend);
      case Job.Mor:
        return this.executeFriendMor(friend);
      case Job.Pie:
        return this.executeFriendPie(friend);
    }
  },
  
  executeFriendIke: function(from) {
    var gir = this.girls;
    var to;
    if(gir[0].exist && gir[0].love != -1
        || gir[1].exist && gir[1].love != -1) {
      if(gir[0].exist && !gir[1].exist)
        to = 0;
      else if(!gir[0].exist && gir[1].exist)
        to = 1;
      else if(gir[0].love != -1 && gir[1].love != -1)
        to = gir[0].like[from] > gir[1].like[from] ? 1 : 0;
      else if(gir[0].love != -1)
        to = 0;
      else
        to = 1;
      return this.talk(from, to, this.topics[0]);
    }
    to = gir.map(function(e, i, arr) {
      return { "g": e, "i": i };
    }).filter(function(e) {
      return e.g.exist;
    }).sort(function(a, b){
      if(a.i == 2) return 1;
      if(b.i == 2) return -1;
      return a.g.like[from] - b.g.like[from];
    })[0].i;
    var topic = this.topics[parseInt(Math.random() * this.topics.length)];
    if(gir[to].like[from] > gir[to].loveArea)
      return this.propose(from, to);
    else if(Math.max.apply(null, gir[to].like) != gir[to].like[from]) {
      if(Math.random() < Boy.def.ikeLieRevealProb[0])
        return this.lie(from, to, topic);
      return this.reveal(from, to);
    }
    return this.talk(from, to, topic);
  },
  
  executeFriendKaz: function(from) {
    var to = this.girls.map(function(e, i, arr) {
      return {"g": e, "i": i};
    }).filter(function(e) {
      return e.g.exist;
    }).sort(function(a, b) {
      if(a.i == 2) return 1;
      if(b.i == 2) return -1;
      var suma = 0;
      a.g.like.forEach(function(e){ suma += e; });
      var sumb = 0;
      b.g.like.forEach(function(e){ sumb += e; });
      return (suma - a.g.like[from]) - (sumb - b.g.like[from]);
    })[0].i;
    return this.executeFriendBasic(from, to);
  },
  
  executeFriendMor: function(from) {
    var gir = this.girls;
    var to;
    if(gir[0].exist && gir[0].like[from] > gir[0].loveArea)
      to = 0;
    else if(gir[1].exist && gir[1].like[from] > gir[1].loveArea)
      to = 1;
    else {
      var exi = gir.filter(function(e){return e.exist});
      to = gir.indexOf(exi[parseInt(Math.random() * exi.length)]);
    }
    return this.executeFriendBasic(from, to);
  },
  
  executeFriendBasic: function(from, to) {
    if(this.girls[to].loveProb(from) > 0.5)
      return this.propose(from, to);
    else {
      var topic = this.topics[parseInt(Math.random() * this.topics.length)];
      var probs = Boy.def.kazTalkLieRevealProb;
      var prob = Math.random();
      var acts = [this.talk, this.lie, this.reveal];
      probs.forEach(function(e) {
        prob -= e;
        if(prob > 0)
          acts.shift();
      });
      return acts[0].apply(this, [from, to, topic]);
    }
  },
  
  executeFriendPie: function(from) {
    var exi = this.girls.filter(function(e) { return e.exist });
    var to = this.girls.indexOf(exi[parseInt(Math.random() * exi.length)]);
    var topic = this.topics[parseInt(Math.random() * this.topics.length)];
    var acts = [this.talk, this.propose, this.lie, this.reveal];
    var probs = Boy.def.pieProb;
    var prob = Math.random();
    probs.forEach(function(e) {
      prob -= e;
      if(prob > 0)
        acts.shift();
    });
    return acts[0].apply(this, [from, to, topic]);
  },
  
  getHints: function() {
    if(this.turn == 0)
      return ["話して", "口説いて", "持ち帰れ！"];
    var hints = [
      ["嘘をつくと", "とりあえずはウケる"],
      ["仲間を売ると", "嘘が暴ける"]];
    var who = Math.floor(Math.random() * 3);
    var best = Math.max.apply(null, this.girls[who].like);
    if(this.girls[who].exist
        && this.girls[who].love == -1
        && best >= this.girls[who].loveArea)
      hints.push([this.girls[who].name + " は", "誰かが気になるようだ"]);
    if(this.girls[who].exist
        && this.girls[who].lie.reduce(function(e){return e}) > 0)
      hints.push([this.girls[who].name + " は", "誰かに騙されているようだ"]);
    var topic = this.topics[0];
    var same = this.topicsPool.filter(function(e) {
      return e.girlIndex == topic.girlIndex && e.text != topic.text;
    }).shuffle()[0];
    hints.push([topic.text, "が好きな娘は", same.text, "も好きなようだ"]);
    return hints.shuffle()[0];
  }
  
});