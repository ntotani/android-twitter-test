LoadingScene = enchant.Class.create(enchant.Scene, {
  initialize: function(userName) {
    enchant.Scene.call(this);
    var lab = new Label("Loading...");
    lab.color = "white";
    lab.x = 220;
    lab.y = 290;
    var counter = 0;
    lab.addEventListener("enterframe", function(e) {
      lab.text = "Loading ";
      for(var i=0; i<counter; i+=1)
        lab.text += ".";
      counter = (counter + 1) % 8;
    });
    this.addChild(lab);
    this.addEventListener("enterframe", function(e) {
      if(GcqEngineFactory.topicsLoaded)
        enchant.Game.instance.replaceScene(new BattleScene());
      else
        GcqEngineFactory.waitLoad();
    });
  }
});
