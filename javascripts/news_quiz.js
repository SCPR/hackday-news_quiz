(function() {
  if (window.JST == null) {
    window.JST = {};
  }

  window.JST['intro'] = function(context) {
    return (function() {
      var $o;
      $o = [];
      $o.push("<h2>Welcome to KPCC’s news quiz, a weekly set of current events questions that round up the top headlines from around Southern California. We encourage you to play, learn and brag about your score.</h2>\n<p>Here’s how it works:There are a total of twelve questions. You’ll have 30 seconds to answer each one. The quicker you answer, the more points you’ll get. If you run out of time, no points for you that round. Sorry, folks.</p>\n<p>We’ll rank your scores by region, and our official sponsor, Kombucha Dog, will give out prizes along the way. We’ll also host quarterly trivia nights around SoCal where the top-ranked players will battle it out for the title of Newsiest Person of the Year.</p>\n<button class='play'>\n  Start!\n</button>");
      return $o.join("\n").replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  };

}).call(this);
(function() {
  if (window.JST == null) {
    window.JST = {};
  }

  window.JST['question'] = function(context) {
    return (function() {
      var $c, $e, $o, a, cname, i, idx, len, ref;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<div class='question'>\n  Question " + this.index + ":");
      $o.push("  " + $e($c(this.question)));
      $o.push("</div>\n<div style='width:300px'>\n  <div class='progress' style='height:4px;background-color:#000'></div>\n</div>\n<ul class='answers'>");
      ref = this.answers;
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        a = ref[idx];
        cname = this.answered && idx === this.correct ? "correct" : "";
        $o.push("  <li class='" + ($e($c(cname))) + "' data-idx='" + ($e($c(idx))) + "'>");
        $o.push("    " + $e($c(a)));
        $o.push("  </li>");
      }
      $o.push("</ul>");
      if (this.answered) {
        $o.push("<p class='explainer'>");
        $o.push("  " + $e($c(this.explainer)));
        $o.push("</p>\n<button class='next'>\n  Go On!\n</button>");
      }
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  };

}).call(this);
(function() {
  if (window.JST == null) {
    window.JST = {};
  }

  window.JST['results'] = function(context) {
    return (function() {
      var $c, $e, $o;
      $e = window.HAML.escape;
      $c = window.HAML.cleanValue;
      $o = [];
      $o.push("<h2>Done!</h2>\n<p>\n  You got");
      $o.push("  " + $e($c(this.score)));
      $o.push("  points, in");
      $o.push("  " + $e($c(this.human_time)));
      $o.push("  <div class=''></div>\n</p>");
      return $o.join("\n").replace(/\s([\w-]+)='true'/mg, ' $1').replace(/\s([\w-]+)='false'/mg, '').replace(/\s(?:id|class)=(['"])(\1)/mg, "");
    }).call(window.HAML.context(context));
  };

}).call(this);
(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.NewsQuiz = (function() {
    function NewsQuiz(data) {
      this.$el = $("#quiz");
      this.questions = new NewsQuiz.Questions(data.questions);
      this.answers = new NewsQuiz.Answers;
      this._view = null;
      this._idx = -1;
      this.displayIntro();
    }

    NewsQuiz.prototype.displayIntro = function() {
      this._view = new NewsQuiz.IntroView;
      this._view.once("start", (function(_this) {
        return function() {
          return _this.displayNextQuestion();
        };
      })(this));
      return this.$el.html(this._view.render().el);
    };

    NewsQuiz.prototype.displayResults = function() {
      this._view = new NewsQuiz.ResultsView({
        collection: this.answers
      });
      return this.$el.html(this._view.render().el);
    };

    NewsQuiz.prototype.displayQuestion = function(idx) {
      this._view = new NewsQuiz.QuestionView({
        model: this.questions.at(idx)
      });
      this.$el.html(this._view.render().el);
      this._view.once("answer", (function(_this) {
        return function(model, clicked_idx, time_taken) {
          return _this._scoreAnswer(model, clicked_idx, time_taken);
        };
      })(this));
      return this._view.once("next", (function(_this) {
        return function() {
          return _this.displayNextQuestion();
        };
      })(this));
    };

    NewsQuiz.prototype.displayNextQuestion = function() {
      this._idx += 1;
      if (this.questions.length > this._idx) {
        return this.displayQuestion(this._idx);
      } else {
        return this.displayResults();
      }
    };

    NewsQuiz.prototype._scoreAnswer = function(model, clicked_idx, time_taken) {
      var answer, correct;
      correct = model.get("correct") === Number(clicked_idx) ? true : false;
      answer = this.answers.add({
        question: model,
        correct: correct,
        time_taken: time_taken
      });
      return console.log("Answer logged.", answer, correct);
    };

    NewsQuiz.Question = (function(superClass) {
      extend(Question, superClass);

      function Question() {
        return Question.__super__.constructor.apply(this, arguments);
      }

      return Question;

    })(Backbone.Model);

    NewsQuiz.Questions = (function(superClass) {
      extend(Questions, superClass);

      function Questions() {
        return Questions.__super__.constructor.apply(this, arguments);
      }

      Questions.prototype.model = NewsQuiz.Question;

      return Questions;

    })(Backbone.Collection);

    NewsQuiz.Answer = (function(superClass) {
      extend(Answer, superClass);

      function Answer() {
        return Answer.__super__.constructor.apply(this, arguments);
      }

      Answer.prototype.score = function() {
        if (this.attributes.correct) {
          return Math.round(50 * (1 - (this.attributes.time_taken / 30000)));
        } else {
          return 0;
        }
      };

      Answer.prototype.toJSON = function() {
        return {
          score: this.score(),
          time_taken: this.attributes.time_taken,
          question: this.attributes.question
        };
      };

      return Answer;

    })(Backbone.Model);

    NewsQuiz.Answers = (function(superClass) {
      extend(Answers, superClass);

      function Answers() {
        return Answers.__super__.constructor.apply(this, arguments);
      }

      Answers.prototype.model = NewsQuiz.Answer;

      Answers.prototype.toJSON = function() {
        var answers, human_time, minutes, seconds, total_score, total_time;
        total_time = 0;
        total_score = 0;
        answers = this.map(function(a) {
          var obj;
          obj = a.toJSON();
          total_time += obj.time_taken;
          total_score += obj.score;
          return obj;
        });
        human_time = (function() {
          switch (false) {
            case !(total_time < 60000):
              return (Math.round(total_time / 1000)) + " seconds";
            case !((60000 <= total_time && total_time < 120000)):
              return "one minute and " + (Math.round((total_time - 60000) / 1000)) + " seconds";
            default:
              minutes = Math.floor(total_time / 60000);
              seconds = Math.round((total_time - minutes * 60000) / 1000);
              return minutes + " minutes and " + seconds + " seconds";
          }
        })();
        return {
          answers: answers,
          score: total_score,
          time: total_time,
          human_time: human_time
        };
      };

      return Answers;

    })(Backbone.Collection);

    NewsQuiz.IntroView = (function(superClass) {
      extend(IntroView, superClass);

      function IntroView() {
        return IntroView.__super__.constructor.apply(this, arguments);
      }

      IntroView.prototype.template = JST["intro"];

      IntroView.prototype.events = {
        "click button.play": "_start"
      };

      IntroView.prototype._start = function() {
        console.log("start clicked");
        return this.trigger("start");
      };

      IntroView.prototype.render = function() {
        this.$el.html(this.template());
        return this;
      };

      return IntroView;

    })(Backbone.View);

    NewsQuiz.QuestionView = (function(superClass) {
      extend(QuestionView, superClass);

      function QuestionView() {
        return QuestionView.__super__.constructor.apply(this, arguments);
      }

      QuestionView.prototype.template = JST["question"];

      QuestionView.prototype.events = {
        "click .answers li": "_answer",
        "click button.next": "_next"
      };

      QuestionView.prototype.initialize = function() {
        this.seconds = 30000;
        this._start_time = null;
        this._end_time = null;
        this._tInt = null;
        return this._answered = false;
      };

      QuestionView.prototype._startTimer = function() {
        var update;
        this._start_time = _.now();
        this._expires = this._start_time + this.seconds;
        this._tInt = setInterval((function(_this) {
          return function() {
            var taken;
            taken = _.now() - _this._start_time;
            if (_.now() > _this._expires) {
              console.log("Time expired. Now what?");
              return _this._answer(null);
            }
          };
        })(this), 200);
        update = (function(_this) {
          return function() {
            var percent, remaining;
            remaining = _this._expires - _.now();
            percent = remaining / _this.seconds * 100;
            $(".progress").css({
              width: percent + "%"
            });
            if (remaining > 0 && !_this._answered) {
              return window.requestAnimationFrame(update);
            }
          };
        })(this);
        return window.requestAnimationFrame(update);
      };

      QuestionView.prototype._endTimer = function(cb) {
        if (this._tInt) {
          clearTimeout(this._tInt);
          this._end_time = _.now();
          console.log("Time to answer was ", this._end_time - this._start_time);
          return cb(this._end_time - this._start_time);
        }
      };

      QuestionView.prototype._answer = function(evt) {
        if (this._answered) {
          return true;
        }
        this._answered = true;
        return this._endTimer((function(_this) {
          return function(time) {
            var answer_idx;
            answer_idx = evt ? evt.currentTarget.dataset.idx : -1;
            console.log("click was on answer #", answer_idx);
            _this.trigger("answer", _this.model, answer_idx, time);
            return _this.render();
          };
        })(this));
      };

      QuestionView.prototype._next = function() {
        return this.trigger("next");
      };

      QuestionView.prototype.render = function() {
        this.$el.html(this.template(_.extend({}, this.model.toJSON(), {
          answered: this._answered,
          index: this.model.collection.indexOf(this.model) + 1
        })));
        if (!this.tInt && !this._answered) {
          this._startTimer();
        }
        return this;
      };

      return QuestionView;

    })(Backbone.View);

    NewsQuiz.ResultsView = (function(superClass) {
      extend(ResultsView, superClass);

      function ResultsView() {
        return ResultsView.__super__.constructor.apply(this, arguments);
      }

      ResultsView.prototype.template = JST["results"];

      ResultsView.prototype.render = function() {
        this.$el.html(this.template(this.collection.toJSON()));
        return this;
      };

      return ResultsView;

    })(Backbone.View);

    return NewsQuiz;

  })();

}).call(this);
