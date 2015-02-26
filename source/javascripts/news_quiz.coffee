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
        @_view.once "answer", (model,clicked_idx,time_taken) =>
            @_scoreAnswer model,clicked_idx,time_taken

        @_view.once "next", =>
            @displayNextQuestion()

    displayNextQuestion: ->
        @_idx += 1

        if @questions.length > @_idx
            @displayQuestion(@_idx)
        else
            @displayResults()

    _scoreAnswer: (model,clicked_idx,time_taken) ->
        # is this answer correct?
        correct = if model.correct == clicked_idx then true else false
        answer = @answers.add question:model, correct:correct, time_taken:time_taken
        console.log "Answer logged.", answer

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

        events:
            "click .answers li": "_answer"
            "click button.next": "_next"

        initialize: ->
            @seconds        = 30000
            @_start_time    = null
            @_end_time      = null
            @_tInt          = null

            @_answered      = false

        _startTimer: ->
            @_start_time = _.now()
            @_tInt = setInterval =>
                taken = _.now() - @_start_time
                console.log "Remaining time is ", @seconds - taken

                if taken > @seconds
                    console.log "Time expired. Now what?"
                    @_end_time = _.now()
                    @trigger "expired"
                    clearInterval @_tInt
            , 200

        _endTimer: (cb) ->
            if @_tInt
                clearTimeout @_tInt
                @_end_time = _.now()
                console.log "Time to answer was ", @_end_time - @_start_time
                cb @_end_time - @_start_time

        _answer: (evt) ->
            # we only care once...
            return true if @_answered

            @_answered = true
            @_endTimer (time) =>
                answer_idx = evt.currentTarget.dataset.idx
                console.log "click was on answer #", answer_idx
                @trigger "answer", @model, answer_idx, time

                # flip to answer view...
                @render()

        _next: ->
            @trigger "next"

        render: ->
            @$el.html @template _.extend {}, @model.toJSON(), answered:@_answered

            # FIXME: there's a cleaner place to trigger this, I'm sure
            @_startTimer() if !@tInt && !@_answered
            @