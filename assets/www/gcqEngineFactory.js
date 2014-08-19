GcqEngineFactory = {
  setFriendJob: function(joba, jobb) {
    var namea = Job.names[joba];
    var nameb = Job.names[jobb];
    if(joba == jobb) {
      namea += "A";
      nameb += "B";
    }
    this.friends = [new Boy(namea, joba), new Boy(nameb, jobb)];
  }, createEngine: function() {
    var boys = [new Boy("勇者", Job.Pla)].concat(this.friends);
    var girls = ["スライみゅ", "ドラぴぃ", "スライみん",
        "ゴースたん", "ドラちぃ", "サソりんりん", "ガイコちゅ",
        "まじょっこ"].map(function(e, i, arr) {
      return { "name":e, "char":i };
    }).shuffle().slice(0, 2).concat([{ "name":"ゴリ子", "char":9 }]).map(function(e) {
      return new Girl(e.name, e.char);
    });
    var topics = [
        new Topic("お酒", 0),
        new Topic("占い", 0),
        new Topic("恋愛", 0),
        new Topic("血液型", 0),
        new Topic("バイト", 0),
        new Topic("スポーツ", 0),
        new Topic("ファッション", 0),
        new Topic("季節", 1),
        new Topic("映画", 1),
        new Topic("兄弟", 1),
        new Topic("仕事", 1),
        new Topic("ネット", 1),
        new Topic("観光地", 1),
        new Topic("地元ネタ", 1),
        new Topic("SM議論", 2),
        new Topic("自作ポエム", 2),
        new Topic("民主党政権", 2),
        new Topic("深夜アニメ", 2),
        new Topic("両親の性癖", 2),
        new Topic("ガンダムの歴史", 2),
        new Topic("とてもまじめなおはなし", 2)];
    var engine = new Engine(boys, girls, topics);
    return engine;
  }
};