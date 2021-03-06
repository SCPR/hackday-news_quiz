#= require_tree ./templates/

class window.NewsQuiz
    constructor: (data) ->
        @$el = $("#quiz")
        @questions  = new NewsQuiz.Questions data.questions
        @answers    = new NewsQuiz.Answers

        @_view = null
        @_idx  = -1

        @displayIntro()

    #----------

    displayIntro: ->
        @_view = new NewsQuiz.IntroView
        @_view.once "start", =>
            @displayNextQuestion()

        @$el.html @_view.render().el

    #----------

    displayResults: ->
        @_view = new NewsQuiz.ResultsView collection:@answers
        @$el.html @_view.render().el

    #----------

    displayQuestion: (idx) ->
        @_view = new NewsQuiz.QuestionView model:@questions.at(idx)
        @$el.html @_view.render().el

        # question view will emit answer when an answer is clicked. we log it,
        # but leave the question view up so that they get the explainer
        @_view.once "answer", (model,clicked_idx,time_taken) =>
            @_scoreAnswer model,clicked_idx,time_taken

        # when they click the next button, we flip questions and get started
        # with a new timer
        @_view.once "next", =>
            @displayNextQuestion()

    #----------

    displayNextQuestion: ->
        @_idx += 1

        if @questions.length > @_idx
            @displayQuestion(@_idx)
        else
            @displayResults()

    #----------

    _scoreAnswer: (model,clicked_idx,time_taken) ->
        # is this answer correct?
        correct = if model.get("correct") == Number(clicked_idx) then true else false
        answer = @answers.add question:model, correct:correct, time_taken:time_taken
        console.log "Answer logged.", answer, correct

    #----------

    class @Question extends Backbone.Model

    #----------

    class @Questions extends Backbone.Collection
        model: NewsQuiz.Question

    #----------

    class @Answer extends Backbone.Model
        score: ->
            # if our answer is correct, score it based on time taken
            if @attributes.correct
                Math.round 50 * ( 1 - ( @attributes.time_taken / 30000 ) )
            else
                0

        toJSON: ->
            score:      @score()
            time_taken: @attributes.time_taken
            question:   @attributes.question

    #----------

    class @Answers extends Backbone.Collection
        model: NewsQuiz.Answer

        toJSON: ->
            total_time  = 0
            total_score = 0

            answers = @map (a) ->
                obj = a.toJSON()

                total_time  += obj.time_taken
                total_score += obj.score

                obj

            human_time = switch
                when total_time < 60000
                    "#{Math.round(total_time / 1000)} seconds"
                when 60000 <= total_time < 120000
                    "one minute and #{Math.round((total_time-60000) / 1000)} seconds"
                else
                    minutes = Math.floor( total_time / 60000 )
                    seconds = Math.round( (total_time - minutes*60000) / 1000 )
                    "#{minutes} minutes and #{seconds} seconds"

            answers:    answers
            score:      total_score
            time:       total_time
            human_time: human_time

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

    #----------

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
            @_start_time    = _.now()
            @_expires       = @_start_time + @seconds

            @_tInt = setInterval =>
                taken = _.now() - @_start_time

                if _.now() > @_expires
                    console.log "Time expired. Now what?"
                    @_answer(null)
            , 200

            update = =>
                remaining = @_expires - _.now()
                percent = remaining / @seconds * 100
                $(".progress").css width:"#{ percent }%"

                if remaining > 0 && !@_answered
                    window.requestAnimationFrame update


            window.requestAnimationFrame update

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
                answer_idx = if evt then evt.currentTarget.dataset.idx else -1
                console.log "click was on answer #", answer_idx
                @trigger "answer", @model, answer_idx, time

                # flip to answer view...
                @render()

        _next: ->
            @trigger "next"

        render: ->
            @$el.html @template _.extend {}, @model.toJSON(), answered:@_answered, index:(@model.collection.indexOf(@model)+1)

            # FIXME: there's a cleaner place to trigger this, I'm sure
            @_startTimer() if !@tInt && !@_answered
            @
    #----------

    class @ResultsView extends Backbone.View
        template: JST["results"]

        render: ->
            @$el.html @template @collection.toJSON()
            @