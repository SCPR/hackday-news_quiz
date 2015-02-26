#= require_tree ./templates/

class window.NewsQuiz
    constructor: (data) ->
        @$el = $("#quiz")
        @questions  = new NewsQuiz.Questions data.questions
        @answers    = new NewsQuiz.Answers {}

        @_view = null
        @_idx  = -1

        @displayIntro()

    displayIntro: ->
        @_view = new NewsQuiz.IntroView
        @_view.once "start", =>
            @displayNextQuestion()

        @$el.html @_view.render().el

    displayQuestion: (idx) ->
        @_view = new NewsQuiz.QuestionView model:@questions.at(idx)
        @$el.html @_view.render().el

        # FIXME: attach events

    displayNextQuestion: ->
        @_idx += 1
        @displayQuestion(@_idx)

    #----------

    class @Question extends Backbone.Model

    #----------

    class @Questions extends Backbone.Collection
        model: NewsQuiz.Question

    #----------

    class @Answer extends Backbone.Model

    #----------

    class @Answers extends Backbone.Collection
        model: NewsQuiz.Answer

    #----------

    class @IntroView extends Backbone.View
        template: JST["intro"]

        events:
            "click button.play": "_start"

        _start: ->
            console.log "start clicked"
            @trigger "start"

        render: ->
            @$el.html @template()
            @

    class @QuestionView extends Backbone.View
        template: JST["question"]

        initialize: ->

        render: ->
            @$el.html @template @model.toJSON()
            @