BattleScene = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);
    var game = enchant.Game.instance;
    var scene = this;
    var engine = GcqEngineFactory.createEngine();
    
    var camera = new Sprite(48, 48);
    camera.image = game.assets['camera.png'];
    camera.x = game.width - camera.width;
    camera.addEventListener(Event.TOUCH_END, function() {
        location.href = 'camera:///';
    });
    
    var boysArea = new BoysArea(engine.boys);
    boysArea.x = 10;
    boysArea.y = 58;
    
    var girla = new IconGirl(engine.girls[0]);
    girla.x = 15;
    girla.y = boysArea.y + 60;
    var girlb = new IconGirl(engine.girls[1]);
    girlb.x = 115;
    girlb.y = girla.y;
    var girlc = new IconGirl(engine.girls[2]);
    girlc.x = 215;
    girlc.y = girla.y;
    var girlIcons = [girla, girlb, girlc];
    
    var focusStack = [];
    var actionList = new ListBox(
        ["話しかける", "口説く", "ウソつく", "仲間を売る", "逃げる"],
        100, game.height - 248,
        function(e) {
          this.focus = false;
          scene.actType = e;
          if(e == 4) {
            pad.visible = false;
            messageArea.visible = true;
            if(engine.girls[2].exist) {
              var mes = createMessage([[
                engine.boys[0].name + " は逃げ出した",
                "しかし " + engine.girls[2].name + " に回り込まれた"]]);
              if(girlIcons[2].firstChild.frame != 28)
                mes.push({
                  getMessage: function() {
                    return [engine.girls[2].name + " は覚醒した", "　"];
                  }, type: ActType.Evolve, to: 2
                });
              messageArea.showMessages(mes);
            } else {
              messageArea.showMessages(createMessage([
                [engine.boys[0].name + " は逃げ出した",
                "しかし　回り込まれた"]]));
            }
          } else {
            var list = talkList;
            if (!(e == ActType.Talk || e == ActType.Lie)) {
                girlList.x = 60;
                list = girlList;
            }
            focusStack.push(list);
            list.focus = true;
            list.visible = true;
          }
        }, true);
    actionList.x = 10;
    actionList.y = girla.y + 120;
    focusStack.push(actionList);
    var talkList = new ListBox(
        engine.topics.map(function(e){ return e.text }),
        250, game.height - 248,
        function(i) {
          scene.selectedTopic = engine.topics[i];
              girlList.x = 110;
          focusStack.push(girlList);
          this.focus = false;
          girlList.focus = true;
          girlList.visible = true;
        }, true);
    talkList.x = 60;
    talkList.y = actionList.y;
    talkList.visible = false;
    
    var girls = engine.girls;
    var girlList = new ListBox(
        girls.map(function(e){ return e.name }),
        200, game.height - 248,
        function(i) {
          girlList.focus = false;
          pad.visible = false;
          messageArea.visible = true;
          messageArea.showMessages(
              engine.executePlayer(scene.actType, i, scene.selectedTopic));
        }, true);
    girlList.x = 110;
    girlList.y = actionList.y;
    girlList.visible = false;
    
    var dummyList = new ListBox([], 200, game.height - 248, function(){});
    dummyList.x = 110;
    dummyList.y = actionList.y;
    dummyList.lab.width = 190;
    
    var messageArea = new MessageArea(engine, function(actResult) {
      function effect() {
        var x = girlIcons[actResult.to].x;
        var y = girlIcons[actResult.to].y;
        scene.addChild(new HeartEffect(x, y + 40));
        scene.addChild(new HeartEffect(x + 50, y + 20));
      }
      if(actResult.type == ActType.Love && actResult.success) {
        boysArea.hide(actResult.from);
        girlIcons[actResult.to].visible = false;
      } else if(actResult.type == ActType.Gohome) {
        girlIcons[actResult.to].visible = false;
      } else if(actResult.type == ActType.Evolve) {
        girlIcons[2].firstChild.frame = 28;
        effect();
      }
      if(actResult.success && actResult.type != ActType.Reveal && actResult.type != ActType.Release) {
        effect();
      }
    }, function() {
      if(!engine.boys[0].exist) {
        messageArea.lab.text = engine.boys[0].name + " と " + engine.girls[engine.boys[0].love].name + " は<br/>夜の街に消えていった<br/><br/>...fin";
        game.pushScene(new ResultScene(engine, true));
      } else if(engine.girls.every(function(e){ return !e.exist })) {
        messageArea.lab.text = engine.boys[0].name + " 達は全滅した<br/><br/>...fin";
        game.pushScene(new ResultScene(engine, false));
      } else {
        engine.refleshTopics();
        if(scene.actType == 4 && engine.girls[2].exist)
          dummyList.updateTexts([engine.girls[2].name, "「私を怒らせない方が良い」"]);
        else
          dummyList.updateTexts(engine.getHints());
        talkList.updateTexts(engine.topics.map(function(e){return e.text}));
        focusStack = [actionList];
        actionList.focus = true;
        talkList.visible = false;
        girlList.visible = false;
        pad.visible = true;
        messageArea.visible = false;
      }
    });
    messageArea.x = 10;
    messageArea.y = actionList.y;
    
    var pad = new Pad();
    pad.x = 220;
    pad.y = 220;
    pad.visible = false;
    
    this.addChild(boysArea);
    this.addChild(girla);
    this.addChild(girlb);
    this.addChild(girlc);
    this.addChild(actionList);
    this.addChild(dummyList);
    this.addChild(talkList);
    this.addChild(girlList);
    this.addChild(messageArea);
    this.addChild(camera);
    //this.addChild(pad);
    var lists = [actionList, talkList, girlList];
    this.addEventListener("upbuttondown", function(e) {
      messageArea.onTap();
      lists.forEach(function(l){ l.onUp() });
    });
    this.addEventListener("downbuttondown", function(e) {
      messageArea.onTap();
      lists.forEach(function(l){ l.onDown() });
    });
    this.addEventListener("rightbuttondown", function(e) {
      lists.filter(function(l){
        return l.focus;
      }).forEach(function(l) {
        l.onRight();
      });
      messageArea.onTap();
    });
    this.addEventListener("leftbuttondown", function(e) {
      messageArea.onTap();
      if(focusStack.length <= 1)
        return;
      var top = focusStack.pop();
      top.focus = false;
      top.visible = false;
      focusStack[focusStack.length - 1].focus = true;
    });
    this.addEventListener("touchstart", function(e) { messageArea.onTap(); });
    messageArea.showMessages(createMessage([[
      engine.girls[0].name + " があらわれた",
      engine.girls[1].name + " があらわれた",
      engine.girls[2].name + " があらわれた"
    ]]));
  }
});

IconGirl = enchant.Class.create(enchant.Group, {
  initialize: function(girl) {
    enchant.Group.call(this);
    function base(frame) {
      var sp = new Sprite(90, 90);
      sp.image = enchant.Game.instance.assets["girls.png"];
      sp.frame = frame;
      return sp;
    }
    if(girl.char == 9) {
      var icon = base(27);
      this.addChild(icon);
    } else {
      var backs = [20, 21, 22, 23, 24, 25, 26, 29];
      var fronts = [0, 1, 0, 2, 3, 4, 5, 6];
      this.addChild(base(backs[girl.char]));
      this.addChild(base(19));
      this.addChild(base(13 + Math.floor(Math.random() * 6)));
      this.addChild(base(7 + Math.floor(Math.random() * 6)));
      this.addChild(base(fronts[girl.char]));
    }
    this.lab = new Label(girl.name);
    this.lab.color = "white";
    this.lab.x = 10;
    this.lab.y = 90;
    this.addChild(this.lab);
  }, visible: {
    set: function(val) {
      this.childNodes.forEach(function(e) { e.visible = val });
    }
  }
});

BoysArea = enchant.Class.create(enchant.Group, {
  initialize: function(boys) {
    enchant.Group.call(this);
    var frame = createFrame(300, 50);
    this.addChild(frame);
    var group = this;
    var tips = ["合コンの幹事", "性格が悪い", "へぼい", "ちゃっかり", "フリーダム"];
    boys.forEach(function(e, i, arr) {
      var lab = new Label(e.name + "<br/>　" + tips[e.job]);
      lab.color = "white";
      lab.x = i * 100 + 10;
      lab.y = 6;
      group.addChild(lab);
    });
  }, visible: {
    set: function(val) {
      this.childNodes.forEach(function(e) { e.visible=val });
    }
  }, hide: function(i) {
    this.childNodes[i + 1].visible = false;
  }
});

ListBox = enchant.Class.create(enchant.Group, {
  initialize: function(list, wid, hei, onSelected, touchable) {
    enchant.Group.call(this);
    var game = Game.instance;
    var that = this;
    var frame = createFrame(wid, hei);
    var listener = new Sprite(wid, hei);
    listener.addEventListener(Event.TOUCH_END, function(e) {
        if (that.focus) {
            var index = Math.floor((e.y - that.y - 10) / ((hei - 20) / 5));
            if (index >= 0 && index < list.length) {
                that.selected = index;
                game.dispatchEvent(new Event('rightbuttondown'));
            }
        } else {
            game.dispatchEvent(new Event('leftbuttondown'));
        }
    });
    var lab = new Label("");
    lab.x = 5;
    lab.y = 10;
    lab.color = "white";
    lab.text = this.defaultText;
    var game = Game.instance;
    this.labels = [0, 0, 0, 0, 0].map(function(e, i) {
        var lab = new Label('');
        lab.x = 5;
        lab.y = i * (hei - 20) / 5 + 10;
        if (!touchable) lab.y = i * 18 + 10;
        lab.color = 'white';
        if (touchable) {
            lab.width = wid - 22;
            lab._element.classList.add('button');
        }
        /*
        lab.addEventListener(Event.TOUCH_END, function() {
            that.selected = i;
            game.dispatchEvent(new Event('rightbuttondown'));
        });*/
        return lab;
    });
    this.onSelected = onSelected;
    this.onChange = function(){}
    this.lab = lab;
    this.focus = false;
    this.addChild(frame);
    //this.addChild(lab);
    this.labels.forEach(function(e) { this.addChild(e) }, this);
    this.addChild(listener);
    this.updateTexts(list);
  }, onUp: function() {
    if(!this.focus || this.selected <= 0)
      return;
    this.selected -= 1;
    this.lab.text = this.selectedTexts[this.selected];
    this.onChange(this.selected);
  }, onDown: function() {
    if(!this.focus || this.selected >= this.selectedTexts.length - 1)
      return;
    this.selected += 1;
    this.lab.text = this.selectedTexts[this.selected];
    this.onChange(this.selected);
  }, onRight: function() {
    if(!this.focus)
      return;
    this.onSelected(this.selected);
  }, focus: {
    get: function() {
      return this._focus;
    }, set: function(val) {
      this._focus = val;
      //if(val) this.lab.text = this.selectedTexts[this.selected];
      //else this.lab.text = this.defaultText;
    }
  }, updateTexts: function(list) {
    var defaultText = list.map(function(e){ return "　" + e }).join("<br/>");
    var selectedTexts = list.map(function(ee, i, arrr) {
      return list.map(function(e, j, arr) {
        return (i == j ? "→" : "　") + e;
      }).join("<br/>")
    });
    this.defaultText = defaultText;
    this.selectedTexts = selectedTexts;
    this.selected = 0;
    this.focus = this.focus;
    this.labels.forEach(function(e, i) {
        if (list[i]) {
            e.text = list[i];
        } else {
            e.text = '';
            e._element.classList.remove('button');
        }
    });
  }, visible: {
    set: function(val) {
      this.childNodes.forEach(function(e){ e.visible = val });
    }
  }
});

MessageArea = enchant.Class.create(enchant.Group, {
  initialize: function(engine, effectGirl, onMessageShowed) {
    enchant.Group.call(this);
    this.engine = engine;
    this.effectGirl = effectGirl;
    this.onMessageShowed = onMessageShowed;
    var frame = createFrame(300, Game.instance.height - 248);
    this.addChild(frame);
    this.lab = new Label("");
    this.lab.width = 280;
    this.lab.color = "white";
    this.lab.x = 10;
    this.lab.y = 10;
    this.addChild(this.lab);
    this.onEnterFrame = function(){}
    this.addEventListener("enterframe", function(e) {
      this.onEnterFrame();
    });
    this.onTap = function(){}
    /*this.addEventListener("touchstart", function(e) {
      this.onTap();
    });*/
  }, showMessages: function(messages) {
    this.messages = messages;
    this.shiftMessage();
  }, shiftMessage: function() {
    if(this.messages.length <= 0) {
      this.onMessageShowed();
    } else {
      var actResult = this.messages.shift();
      var message = actResult.getMessage(this.engine);
      var counter = 0;
      this.onEnterFrame = function() {
        if(counter <= 0) {
          this.lab.text += message.shift() + "<br/>";
          if(message.length <= 0) {
            this.onEnterFrame = function(){}
            this.onTap = function() {
              this.onTap = function(){}
              this.lab.text = "";
              this.shiftMessage();
            }
            this.effectGirl(actResult);
          } else
            counter = 12;
        }
        counter -= 1;
      }
    }
  }, visible: {
    set: function(val) {
      this.childNodes.forEach(function(e){ e.visible = val });
    }
  }
});

HeartEffect = enchant.Class.create(enchant.Sprite, {
  initialize: function(x, y) {
    enchant.Sprite.call(this, 90, 50);
    this.image = enchant.Game.instance.assets["heart.png"];
    this.x = x;
    this.y = y;
    this.addEventListener("enterframe", function(e) {
      this.frame += 1;
      if(this.frame >= 15)
        enchant.Game.instance.currentScene.removeChild(this);
    });
  }
});

function createFrame(wid, hei) {
  var rad = 12;
  var sur = new Surface(wid, hei);
  var ctx = sur.context;
  ctx.lineWidth = 4;
  ctx.strokeStyle = "white";
  ctx.rect(0, 0, wid, hei);
  ctx.stroke();
  var frame = new Sprite(wid, hei);
  frame.backgroundColor = "black";
  frame.image = sur;
  return frame;
}

function createMessage(messages) {
  return messages.map(function(e) {
    return { getMessage: function() { return e; } }
  });
}
