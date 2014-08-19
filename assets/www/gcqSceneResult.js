ResultScene = enchant.Class.create(enchant.Scene, {
  initialize: function(engine, success) {
    enchant.Scene.call(this);
    function nextScene(e) {
      if(location.hostname == 'r.jsgames.jp') {
        var result;
        if(success) {
          result = engine.turn + "時間口説いた結果お持ち帰りできました #gocomq"
        } else
          result = engine.turn + "万円貢いで逃げられました #gocomq";
        var id = location.pathname.match(/^\/games\/(\d+)/)[1];
        location.replace([
          'http://9leap.net/games/', id, '/result',
          '?score=', encodeURIComponent(engine.turn),
          '&result=', encodeURIComponent(result)
        ].join(''));
      } else {
        enchant.Game.instance.popScene();
        enchant.Game.instance.replaceScene(new TitleScene());
      }
    }
    this.addEventListener("touchstart", nextScene);
    this.addEventListener("leftbuttondown", nextScene);
    this.addEventListener("rightbuttondown", nextScene);
    this.addEventListener("upbuttondown", nextScene);
    this.addEventListener("downbuttondown", nextScene);
  }
});