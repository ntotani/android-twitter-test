TitleScene = enchant.Class.create(enchant.Scene, {
  initialize: function() {
    enchant.Scene.call(this);
    var title = new Sprite(320, 320);
    title.image = enchant.Game.instance.assets["title.png"];
    var counter = 12;
    this.addEventListener("enterframe", function(e) {
      counter -= 1;
      if(counter <= 0) {
        counter = 12;
        nav.visible = !nav.visible;
        pad.visible = !pad.visible;
      }
    });
    
    var nav = new Label("tap to start");
    nav.color = "white";
    nav.x = 230;
    nav.y = 260;
    
    var pad = new Sprite(100, 100);
    pad.image = enchant.Game.instance.assets["pad.png"];
    pad.x = 220;
    pad.y = 220;
    pad.visible = false;
    
    this.addChild(title);
    this.addChild(nav);
    this.addChild(pad);
    function nextScene(e) {
      if(e.type != "touchstart" || e.x >= pad.x && e.y >= pad.y)
        enchant.Game.instance.replaceScene(new FriendScene(function() {
          enchant.Game.instance.replaceScene(new BattleScene());
        }));
    }
    this.addEventListener("touchstart", nextScene);
    this.addEventListener("leftbuttondown", nextScene);
    this.addEventListener("rightbuttondown", nextScene);
    this.addEventListener("upbuttondown", nextScene);
    this.addEventListener("downbuttondown", nextScene);
  }
});