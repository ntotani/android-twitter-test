ResultScene = enchant.Class.create(enchant.Scene, {
  initialize: function(engine, success) {
    enchant.Scene.call(this);
    var url = "log.txt?id=" + GcqEngineFactory.player;
    if(success)
      url += "&get=" + engine.girls[engine.boys[0].love].name.substr(1);
    $.get(url);
    
    var result;
    if(success)
      result = "@" + GcqEngineFactory.player + " は" + engine.turn + "時間口説いた結果お持ち帰りできました"
    else
      result = "@" + GcqEngineFactory.player + " は" + engine.turn + "万円貢いで逃げられました";
    
    var nav = new Label(result);
    nav.color = "white";
    nav.width = 300;
    nav.x = 10;
    nav.y = 10;
    
    var tweet = new Label("結果をツイート");
    tweet.color = "white";
    tweet.font = "36px sans-serif";
    tweet.x = 40;
    tweet.y = 80;
    
    var top = new Label("もう一度遊ぶ");
    top.color = "white";
    top.font = "36px sans-serif";
    top.x = 45;
    top.y = 200;
    
    var scene = this;
    function nextScene(e) {
      scene.backgroundColor = "black";
      scene.addChild(nav);
      scene.addChild(tweet);
      scene.addChild(top);
      scene.removeEventListener("touchstart", arguments.callee);
      scene.removeEventListener("leftbuttondown", arguments.callee);
      scene.removeEventListener("rightbuttondown", arguments.callee);
      scene.removeEventListener("upbuttondown", arguments.callee);
      scene.removeEventListener("downbuttondown", arguments.callee);
      scene.addEventListener("touchstart", function(e) {
        if(e.y < 170) {
          result += " #gocomq http://j.mp/iCxtu0";
          window.open("http://twitter.com?status=" + encodeURIComponent(result));
        } else
          location.replace("title.html");
      });
    }
    this.addEventListener("touchstart", nextScene);
    this.addEventListener("leftbuttondown", nextScene);
    this.addEventListener("rightbuttondown", nextScene);
    this.addEventListener("upbuttondown", nextScene);
    this.addEventListener("downbuttondown", nextScene);
  }
});