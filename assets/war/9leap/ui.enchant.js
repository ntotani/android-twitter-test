enchant.ui = { assets: ['pad.png', 'pad4girl.png'] };
enchant.ui.Pad = enchant.Class.create(enchant.Group, {
    initialize: function(girl) {
        enchant.Group.call(this);
        var game = enchant.Game.instance;
        var image = game.assets['pad.png'];
        if(girl)
          image = game.assets['pad4girl.png'];
        var sprite = new Sprite(image.width / 2, image.height);
        sprite.image = image;
        var up = new Label("↑");
        up.color = "yellow";
        up.x = 43;
        up.y = 10;
        var down = new Label("↓");
        down.color = "yellow";
        down.x = 43;
        down.y = 70;
        var ok = new Label("決定");
        ok.color = "yellow";
        ok.x = 65;
        ok.y = 40;
        var no = new Label("戻る");
        no.color = "yellow";
        no.x = 10;
        no.y = 40;
        this.addChild(sprite);
        this.addChild(up);
        this.addChild(down);
        this.addChild(ok);
        this.addChild(no);
        this.input = { left: false, right: false, up: false, down:false };
        this.addEventListener('touchstart', function(e) {
            this._updateInput(this._detectInput(e.localX, e.localY));
        });
        this.addEventListener('touchmove', function(e) {
            this._updateInput(this._detectInput(e.localX, e.localY));
        });
        this.addEventListener('touchend', function(e) {
            this._updateInput({ left: false, right: false, up: false, down:false });
        });
    },
    _detectInput: function(x, y) {
        x -= this.firstChild.width / 2;
        y -= this.firstChild.height / 2;
        var input = { left: false, right: false, up: false, down:false };
        if (x * x + y * y > 200) {
            if (x < 0 && y < x * x * 0.1 && y > x * x * -0.1) {
                input.left = true;
            }
            if (x > 0 && y < x * x * 0.1 && y > x * x * -0.1) {
                input.right = true;
            }
            if (y < 0 && x < y * y * 0.1 && x > y * y * -0.1) {
                input.up = true;
            }
            if (y > 0 && x < y * y * 0.1 && x > y * y * -0.1) {
                input.down = true;
            }
        }
        return input;
    },
    _updateInput: function(input) {
        var game = enchant.Game.instance;
        ['left', 'right', 'up', 'down'].forEach(function(type) {
            if (this.input[type] && !input[type]) {
                game.dispatchEvent(new Event(type + 'buttonup'));
            }
            if (!this.input[type] && input[type]) {
                game.dispatchEvent(new Event(type + 'buttondown'));
            }
        }, this);
        this.input = input;
    }, visible: {
      get: function() {
        return this.firstChild.visible;
      },
      set: function(value) {
        this.childNodes.forEach(function(e) { e.visible = value });
      }
    }
});
