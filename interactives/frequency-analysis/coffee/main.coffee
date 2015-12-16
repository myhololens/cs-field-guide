"use strict"
require('es5-shim')
require('es6-shim')
Chart = require('chart.js')

TextID = "#interactive-frequency-analysis-input"
ChartID = "#interactive-frequency-analysis-chart-display"

ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

characterFrequencies = (string) ->
    ### Given a string this gives a map of frequencies ###
    freqs = new Map()
    for char in string
        newCount = (freqs.get(char) ? 0) + 1
        freqs.set(char, newCount)
    return freqs

# Keep reference to a chart so we can destroy it when we replace it
chart = null

$("#interactive-frequency-analysis-button").click ->
    # Render the chart when clicked, destroy old chart if it exists
    ctx = $(ChartID)[0].getContext('2d')
    if chart?
        chart.destroy()

    text = $(TextID).val().toUpperCase()

    frequencies = characterFrequencies(text)
    frequencies = Array.from(frequencies).sort (element1, element2) ->
        # Sort according to the max values
        if element1[1] > element2[1]
            return -1
        else if element1[1] is element2[1]
            if element1[0] > element2[0]
                return 1
            else
                return -1
        else
            return 1

    # Just alphabetic characters for this interactive
    frequencies = frequencies.filter (pair) -> pair[0] in ALPHABET

    $(ChartID)[0].width = frequencies.length*20 + 30

    labels = frequencies.map (pair) -> pair[0] # Keys
    freqData = frequencies.map (pair) -> pair[1] # Values
    data =
        labels: labels
        datasets: [
            {
                label: "Character Frequency"
                data: freqData
                barWidth: 20
            }
        ]

    chart = new Chart(ctx).Bar(data)