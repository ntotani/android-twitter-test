FriendScene = enchant.Class.create(enchant.Scene, {
  initialize: function(onSelectJob) {
    enchant.Scene.call(this);
    var nav = new ListBox(["連れて行く仲間の職業を選択して下さい"], 300, 40);
    nav.x = 10;
    nav.y = 10;
    
    var laba = new Label("職業");
    laba.color = "white";
    laba.x = 55;
    laba.y = 60;
    
    var selectedJobs = [];
    var jobs = new ListBox(Job.names.slice(1), 100, 100, function(i) {
      names.push(Job.names[i + 1]);
      friends.updateTexts(names);
      selectedJobs.push(i + 1);
      if(selectedJobs.length >= 2) {
        jobs.focus = false;
        confirm.visible = true;
        confirm.focus = true;
      }
    });
    jobs.x = 55;
    jobs.y = 80;
    jobs.onChange = function(i) {
      messageArea.updateTexts(messages[i]);
    }
    jobs.focus = true;
    
    var labb = new Label("パーティ");
    labb.color = "white";
    labb.x = 165;
    labb.y = 60;
    
    var names = ["勇者"];
    var friends = new ListBox(names, 100, 80);
    friends.x = 165;
    friends.y = 80;
    
    var messages = [
        ["イケメン", "　性格が悪い"],
        ["数合わせ", "　へぼい"],
        ["盛り上げ役", "　ちゃっかりしている"],
        ["自由人", "　考えていることが不明"]
    ];
    var messageArea = new ListBox(messages[0], 300, 120);
    messageArea.x = 10;
    messageArea.y = 190;
    
    function confirmBack() {
      confirm.focus = false;
      confirm.visible = false;
      selectedJobs = [];
      names = ["勇者"];
      friends.updateTexts(names);
      jobs.focus = true;
    }
    var confirm = new ListBox(["決定", "選び直す"], 100, 60, function(i) {
      if(i == 0) {
        GcqEngineFactory.setFriendJob(selectedJobs[0], selectedJobs[1]);
        //enchant.Game.instance.replaceScene(new BattleScene());
        onSelectJob();
      } else {
        confirmBack();
      }
    });
    confirm.x = 100;
    confirm.y = 150;
    confirm.visible = false;
    
    var pad = new Pad();
    pad.x = 220;
    pad.y = 220;
    
    this.addChild(nav);
    this.addChild(laba);
    this.addChild(jobs);
    this.addChild(labb);
    this.addChild(friends);
    this.addChild(messageArea);
    this.addChild(confirm);
    this.addChild(pad);
    
    var lists = [jobs, confirm];
    this.addEventListener("upbuttondown", function(e) {
      lists.forEach(function(e){e.onUp()});
    });
    this.addEventListener("downbuttondown", function(e) {
      lists.forEach(function(e){e.onDown()});
    });
    this.addEventListener("rightbuttondown", function(e) {
      lists.filter(function(e) {
        return e.focus;
      }).forEach(function(e) {
        e.onRight();
      });
    });
    this.addEventListener("leftbuttondown", function(e) {
      if(confirm.focus)
        confirmBack();
      else if(jobs.focus && names.length > 1) {
        names.pop();
        friends.updateTexts(names);
        selectedJobs.pop();
      }
    });
  }
});