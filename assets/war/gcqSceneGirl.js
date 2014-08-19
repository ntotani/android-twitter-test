GirlScene = enchant.Class.create(enchant.Scene, {
  initialize: function(userName) {
    enchant.Scene.call(this);
    GcqEngineFactory.player = userName;
    var nav = new ListBox(["好きなフォロワーを選んで下さい"], 300, 40);
    nav.x = 10;
    nav.y = 10;
    
    var laba = new Label("頭文字");
    laba.color = "white";
    laba.x = 55;
    laba.y = 60;
    
    var alpha = new Array(27);
    for(var i=0; i<26; i+=1)
      alpha[i] = String.fromCharCode(i + 65);
    alpha[26] = "その他";
    var initial = new ListBoxLong([alpha], 70, 210, 10);
    initial.focus = true;
    initial.x = 55;
    initial.y = 80;
    initial.onChange = function(i) {
      following.selectedCol = i;
    }
    initial.onSelected = function(i) {
      initial.focus = false;
      following.selectedRow = 0;
      following.showRow = 0;
      following.focus = true;
    }
    
    var labb = new Label("ID");
    labb.color = "white";
    labb.x = 135;
    labb.y = 60;
    
    var names = new Array(27);
    for(var i=0; i<27; i+=1)
      names[i] = [];
    var following = new ListBoxLong(names, 140, 210, 10);
    following.x = 135;
    following.y = 80;
    following.onSelected = function(i, val) {
      GcqEngineFactory.managerGirl = val;
      following.focus = false;
      confirm.visible = true;
      confirm.focus = true;
    }
    this.friends = following;
    
    function confirmBack() {
      confirm.visible = false;
      confirm.focus = false;
      following.focus = true;
    }
    var confirm = new ListBox(["決定", "選び直す"], 100, 60, function(i) {
      if(i == 0) {
        var s = new FriendScene(function() {
          enchant.Game.instance.replaceScene(new LoadingScene());
        });
        s.addEventListener("enterframe", function(e) {
          GcqEngineFactory.waitLoad();
        });
        enchant.Game.instance.replaceScene(s);
      } else
        confirmBack();
    });
    confirm.x = 100;
    confirm.y = 150;
    confirm.visible = false;
    
    var pad = new Pad(true);
    pad.x = 220;
    pad.y = 220;
    
    this.addChild(nav);
    this.addChild(laba);
    this.addChild(initial);
    this.addChild(labb);
    this.addChild(following);
    this.addChild(confirm);
    this.addChild(pad);
    this.addEventListener("upbuttondown", function(e) {
      confirm.onUp();
      following.onUp();
      initial.onUp();
    });
    this.addEventListener("downbuttondown", function(e) {
      confirm.onDown();
      following.onDown();
      initial.onDown();
    });
    this.addEventListener("rightbuttondown", function(e) {
      if(confirm.focus)
        confirm.onRight();
      else {
        following.onRight();
        initial.onRight();
      }
    });
    this.addEventListener("leftbuttondown", function(e) {
      if(confirm.focus)
        confirmBack();
      else if(following.focus) {
        following.focus = false;
        initial.focus = true;
      }
    });
    GcqEngineFactory.who = userName;
    GcqEngineFactory.getFriends({"next_cursor" : -1, "users" : []});
  }, addFriend: function(userName) {
    var col = userName.toUpperCase().charCodeAt(0) - 65;
    if(col < 0 || col >= 26)
      col = 26;
    this.friends.push(col, userName);
  }
});

ListBoxLong = enchant.Class.create(enchant.Group, {
  initialize: function(list, wid, hei, showNum) {
    enchant.Group.call(this);
    var frame = createFrame(wid, hei);
    var lab = new Label("");
    lab.x = 5;
    lab.y = 10;
    lab.color = "white";
    this.lab = lab;
    this.list = list;
    this.showRow = 0;
    this.showNum = showNum;
    this.selectedCol = 0;
    this.selectedRow = 0;
    this.onSelected = function(){};
    this.onChange = function(){}
    this.focus = false;
    this.addChild(frame);
    this.addChild(lab);
  }, onUp: function() {
    if(!this.focus || this.selectedRow <= 0)
      return;
    this.selectedRow -= 1;
    if(this.selectedRow < this.showRow)
      this.showRow -= 1;
    this.updateText();
    this.onChange(this.selectedRow);
  }, onDown: function() {
    if(!this.focus || this.selectedRow >= this.list[this.selectedCol].length - 1)
      return;
    this.selectedRow += 1;
    if(this.selectedRow >= this.showRow + this.showNum)
      this.showRow += 1;
    this.updateText();
    this.onChange(this.selectedRow);
  }, onRight: function() {
    if(!this.focus)
      return;
    this.onSelected(this.selectedRow, this.list[this.selectedCol][this.selectedRow]);
  }, updateText: function() {
    var selected = this.selectedRow;
    var showRow = this.showRow;
    var focus = this.focus;
    var list = this.list[this.selectedCol].concat();
    this.lab.text = list.splice(showRow, this.showNum).map(function(e, i, arr) {
      return ((selected - showRow) == i && focus ? "→" : "　") + e;
    }).join("<br/>");
  }, focus: {
    get: function() {
      return this._focus;
    }, set: function(val) {
      this._focus = val;
      this.updateText();
    }
  }, selectedCol: {
    get: function() {
      return this._selectedCol;
    }, set: function(val) {
      if(val < 0 || val >= this.list.length)
        return;
      this._selectedCol = val;
      this.updateText();
    }
  }, push: function(col, val) {
    this.list[col].push(val);
    this.list[col].sort();
    this.updateText();
  }
});