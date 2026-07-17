"use strict";
const BOARD_HEIGHT = 70;
const DIRECTIONS = [{
        "x": 1,
        "y": 0
    }, {
        "x": -1,
        "y": 0
    }, {
        "x": 0,
        "y": 1
    }, {
        "x": 0,
        "y": -1
    }];
const MODE_NAMES = {
    "standard": "",
    "fairy": "Fairy "
};
const SIZE_NAMES = {
    4: "Easy",
    5: "Medium",
    6: "Hard",
    7: "Extreme",
    8: "Hell"
};
const THEME_LIST = ["white", "peach", "beige", "soft", "blorange", "blackellow", "lemon", "sky", "cosmic"];
const THEME_NAMES = {
    "white": "White",
    "peach": "Peach",
    "beige": "Beige",
    "soft": "Soft",
    "blorange": "Blorange",
    "blackellow": "Blackellow",
    "lemon": "Lemon",
    "sky": "Sky",
    "cosmic": "Cosmic"
};
const NUMBERS = [
    138657838,
    191607277,
    824254011,
    857078627,
    707504085,
    711653502,
    653521121,
    678820449,
    530714820,
    264193238,
    639608071,
    892496524,
    641455028,
    297870890,
    465750785,
    300972793,
    604543465,
    590904429,
    134427868,
    166836225,
    224038034,
    864979861,
    378210702,
    532635143,
    764284153,
    301031741,
    707181069,
    629854427,
    145859672,
    912226823,
    352726075
];
const DATE = new Date();
let boardSize = 4;
function generateBoard(size, value) {
    let arr = [], tempArr = [];
    for (let i = 0; i < size; i++)
        tempArr.push(value);
    for (let i = 0; i < size; i++)
        arr.push(structuredClone(tempArr));
    return arr;
}
function checkGridAvailability(board, coord, pathCoords) {
    if (board[coord.x][coord.y] == Number(!board[pathCoords[0].x][pathCoords[0].y]))
        return false;
    for (let i of pathCoords)
        if (i.x == coord.x && i.y == coord.y)
            return false;
    let tempBoard = structuredClone(board);
    tempBoard[coord.x][coord.y] = tempBoard[pathCoords[0].x][pathCoords[0].y];
    let regions = getRegions(tempBoard);
    return getRegion(regions, pathCoords[0]).isLine;
}
function generateAnswer(size, isTodaysPuzzle) {
    let randFunc;
    if (isTodaysPuzzle)
        randFunc = rand;
    else
        randFunc = Math.random;
    let board = generateBoard(size, -1);
    let ends = generateBoard(size, false);
    let length = Math.floor(randFunc() * (size ** 2 - 2)) + 2;
    let pathCoords = [];
    let coord = {
        "x": Math.floor(randFunc() * size),
        "y": Math.floor(randFunc() * size)
    };
    pathCoords.push(structuredClone(coord));
    let color = Math.round(randFunc());
    board[coord.x][coord.y] = color;
    expandRegion(board, coord, length, isTodaysPuzzle);
    let regions = getRegions(board);
    getRegion(regions, coord).finished = true;
    let hasUnfilledGrids = true;
    while (hasUnfilledGrids) {
        for (let i of regions) {
            if (!i.finished && i.isLine) {
                for (let end of i.ends) {
                    expandRegion(board, end, Infinity, isTodaysPuzzle);
                    i.finished = true;
                }
                break;
            }
        }
        let regions2 = getRegions(board);
        for (let i of regions) {
            if (i.finished)
                getRegion(regions2, i.grids[0]).finished = true;
        }
        regions = structuredClone(regions2);
        hasUnfilledGrids = false;
        for (let i of board)
            for (let j of i)
                if (j == -1) {
                    hasUnfilledGrids = true;
                }
        if (!hasUnfilledGrids) {
            regions.sort(function (a, b) {
                return b.ends.length * b.grids.length - a.ends.length * a.grids.length;
            });
            regions = regions.slice(0, size - 2);
            for (let j of regions)
                if (j.isLine && j.grids.length > 1) {
                    ends[j.ends[0].x][j.ends[0].y] = true;
                    ends[j.ends[1].x][j.ends[1].y] = true;
                }
        }
    }
    console.log("answer", board);
    return {
        "board": board,
        "ends": ends
    };
}
function reverse(arr) {
    let arr2 = [];
    for (let i of arr)
        arr2.unshift(i);
    return arr;
}
function expandRegion(board, startCoord, length, isTodaysPuzzle) {
    if (!getRegion(getRegions(board), startCoord).isLine)
        return;
    let randFunc;
    if (isTodaysPuzzle)
        randFunc = rand;
    else
        randFunc = Math.random;
    let pathCoords = [];
    let coord = structuredClone(startCoord);
    let regions = getRegions(board);
    pathCoords = getRegion(regions, startCoord).grids;
    if (pathCoords[pathCoords.length - 1].x != startCoord.x || pathCoords[pathCoords.length - 1].y != startCoord.y)
        pathCoords = reverse(pathCoords);
    let color = board[startCoord.x][startCoord.y];
    for (let i of pathCoords) {
        if ((i.x == getRegion(regions, startCoord).ends[0].x && i.y == getRegion(regions, startCoord).ends[0].y) || (i.x ==
            getRegion(regions, startCoord).ends[1].x && i.y == getRegion(regions, startCoord).ends[1].y))
            continue;
        for (let j of DIRECTIONS) {
            if (i.x + j.x < 0 || i.x + j.x >= board.length || i.y + j.y >= board.length || i.y + j.y < 0)
                continue;
            if (board[i.x + j.x][i.y + j.y] != color)
                board[i.x + j.x][i.y + j.y] = Number(!color);
        }
        checkOShape(board);
    }
    if (!getRegion(getRegions(board), startCoord).isLine)
        return;
    board[coord.x][coord.y] = color;
    for (let i = 0; i < length; i++) {
        let dirAvailable = [];
        for (let j of DIRECTIONS) {
            if (coord.x + j.x < 0 || coord.x + j.x >= board.length || coord.y + j.y >= board.length || coord.y + j.y < 0)
                continue;
            if (checkGridAvailability(board, {
                "x": coord.x + j.x,
                "y": coord.y + j.y
            }, pathCoords))
                dirAvailable.push(j);
        }
        if (dirAvailable.length) {
            let dir = dirAvailable[Math.floor(randFunc() * dirAvailable.length)];
            coord.x = coord.x + dir.x;
            coord.y = coord.y + dir.y;
            pathCoords.push(structuredClone(coord));
            board[coord.x][coord.y] = color;
            let lastCoord = pathCoords[pathCoords.length - 2];
            for (let j of DIRECTIONS) {
                if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= board.length || lastCoord.y + j.y >= board.length || lastCoord.y + j.y < 0)
                    continue;
                if (board[lastCoord.x + j.x][lastCoord.y + j.y] != color)
                    board[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
                checkOShape(board);
            }
        }
        else
            break;
    }
    let lastCoord = pathCoords[pathCoords.length - 1];
    for (let j of DIRECTIONS) {
        if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= board.length || lastCoord.y + j.y >= board.length || lastCoord.y + j.y < 0)
            continue;
        if (board[lastCoord.x + j.x][lastCoord.y + j.y] != color)
            board[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
    }
    if (!getRegion(getRegions(board), startCoord).isLine)
        return;
    checkOShape(board);
}
function checkOShape(board) {
    for (let i = 0; i < board.length; i++)
        for (let j = 0; j < board.length; j++) {
            if (board[i][j] == -1)
                continue;
            for (let dimension1 of [DIRECTIONS[0], DIRECTIONS[1]])
                for (let dimension2 of [DIRECTIONS[2], DIRECTIONS[3]]) {
                    if (i + dimension1.x < 0 || i + dimension1.x >= board.length || j + dimension2.y >= board.length || j + dimension2.y < 0)
                        continue;
                    if (board[i][j] == board[i + dimension1.x][j] && board[i][j] == board[i][j + dimension2.y])
                        board[i + dimension1.x][j + dimension2.y] = Number(!board[i][j]);
                }
        }
}
function getRegions(board) {
    let regions = [];
    for (let i = 0; i < board.length; i++)
        for (let j = 0; j < board.length; j++) {
            if (board[i][j] == -1)
                continue;
            regions.push({
                "grids": [{
                        "x": i,
                        "y": j
                    }],
                "isLine": true,
                "ends": [{
                        "x": i,
                        "y": j
                    }, {
                        "x": i,
                        "y": j
                    }],
                "finished": false
            });
        }
    for (let i = 0; i < board.length; i++)
        for (let j = 0; j < board.length; j++) {
            if (board[i][j] == -1)
                continue;
            for (let dir of [{
                    "x": 1,
                    "y": 0
                }, {
                    "x": 0,
                    "y": 1
                }])
                if (i + dir.x < board.length && j + dir.y < board.length && board[i + dir.x][j + dir.y] == board[i][j]) {
                    let region1Index = 0, region2Index = 0;
                    for (; region1Index < regions.length; region1Index++) {
                        if (gridIndexOf(regions[region1Index].grids, {
                            "x": i,
                            "y": j
                        }) != -1)
                            break;
                    }
                    for (; region2Index < regions.length; region2Index++) {
                        if (gridIndexOf(regions[region2Index].grids, {
                            "x": i + dir.x,
                            "y": j + dir.y
                        }) != -1)
                            break;
                    }
                    merge(regions, region1Index, region2Index);
                }
        }
    return regions;
}
function merge(regions, region1Index, region2Index) {
    if (region1Index == region2Index)
        return;
    let combinedIsLine = false;
    if (!(regions[region1Index].isLine && regions[region2Index].isLine)) {
        regions[region1Index].isLine = false;
        regions[region1Index].ends = [];
    }
    else {
        if (regions[region1Index].ends[0].x == regions[region1Index].ends[1].x && regions[region1Index].ends[0].y == regions[region1Index]
            .ends[1].y && regions[region2Index].ends[0].x == regions[region2Index].ends[1].x && regions[region2Index].ends[0].y ==
            regions[region2Index].ends[1].y
            && Math.abs(regions[region1Index].ends[0].x - regions[region2Index].ends[0].x) + Math.abs(regions[region1Index].ends[0].y -
                regions[region2Index].ends[0].y) == 1) {
            regions[region1Index].isLine = true;
            regions[region1Index].ends = [regions[region1Index].ends[0], regions[region2Index].ends[0]];
            combinedIsLine = true;
        }
        else
            outerFor: for (let i of [0, 1]) {
                for (let j of [0, 1])
                    if (Math.abs(regions[region1Index].ends[i].x - regions[region2Index].ends[j].x) + Math.abs(regions[region1Index].ends[i].y -
                        regions[region2Index].ends[j].y) == 1 && Math.abs(regions[region1Index].ends[Number(!i)].x - regions[region2Index]
                        .ends[Number(!j)].x) + Math.abs(regions[region1Index].ends[Number(!i)].y - regions[region2Index].ends[Number(!j)].y) > 1) {
                        regions[region1Index].isLine = true;
                        regions[region1Index].ends = [regions[region1Index].ends[Number(!i)], regions[region2Index].ends[Number(!j)]];
                        combinedIsLine = true;
                        break outerFor;
                    }
            }
        if (combinedIsLine) {
            let neighbors = 0;
            for (let region1Grid of regions[region1Index].grids)
                for (let region2Grid of regions[region2Index].grids) {
                    if (Math.abs(region1Grid.x - region2Grid.x) + Math.abs(region1Grid.y - region2Grid.y) == 1)
                        neighbors++;
                }
            if (neighbors != 1)
                combinedIsLine = false;
        }
        if (!combinedIsLine) {
            regions[region1Index].isLine = false;
            regions[region1Index].ends = [];
        }
    }
    regions[region1Index].grids.push(...regions[region2Index].grids);
    if (combinedIsLine) {
        let arr = [];
        arr.push(regions[region1Index].ends[0]);
        for (let num = 0; num < regions[region1Index].grids.length - 1; num++)
            for (let i of regions[region1Index].grids) {
                if (Math.abs(i.x - arr[arr.length - 1].x) + Math.abs(i.y - arr[arr.length - 1].y) == 1 && gridIndexOf(arr, i) == -1)
                    arr.push(i);
            }
        regions[region1Index].grids = arr;
    }
    regions.splice(region2Index, 1);
}
function gridIndexOf(coordGroup, coord) {
    for (let i = 0; i < coordGroup.length; i++)
        if (coordGroup[i].x == coord.x && coordGroup[i].y == coord.y)
            return i;
    return -1;
}
function getRegion(regions, coord) {
    for (let region of regions)
        for (let grid of region.grids)
            if (grid.x == coord.x && grid.y == coord.y)
                return region;
}
let stylesheet = new CSSStyleSheet();
document.adoptedStyleSheets.push(stylesheet);
function renderBoard(board, ends, numbers, given) {
    document.getElementById("board").innerHTML = "";
    for (let i = 0; i < board.length; i++)
        for (let j = 0; j < board[i].length; j++) {
            let grid = document.createElement("div");
            grid.classList.add("grid");
            if (board[i][j] == 0)
                grid.classList.add("white");
            else if (board[i][j] == 1)
                grid.classList.add("black");
            if (ends[i][j])
                grid.classList.add("end");
            if (numbers[i][j] != 0)
                grid.innerText = numbers[i][j].toString();
            grid.dataset.x = i.toString();
            grid.dataset.y = j.toString();
            if (given[i][j] != -1)
                grid.classList.add("given");
            document.getElementById("board").appendChild(grid);
        }
    document.getElementById("board").dataset.size = board.length.toString();
    document.getElementById("board").style.gridTemplateColumns = `repeat(${board.length}, 1fr)`;
    document.getElementById("board").style.gridTemplateRows = `repeat(${board.length}, 1fr)`;
    document.getElementById("board").style.fontSize = `min(${BOARD_HEIGHT / board.length * 2 / 3}vh, ${90 / board.length * 2 / 3}vw)`;
    if (stylesheet.cssRules.length)
        stylesheet.deleteRule(0);
    stylesheet.insertRule(`#board .grid {
            line-height: min(${BOARD_HEIGHT / board.length}vh, ${90 / board.length}vw);
            &.end::before {
                border-width: min(${BOARD_HEIGHT / board.length / 6 * 2 / 3}vh, ${90 / board.length / 6 * 2 / 3}vw);
            }
            &.given::after, &.locked::after {
                width: min(${BOARD_HEIGHT / board.length / 6}vh, ${90 / board.length / 6}vw);
                height: min(${BOARD_HEIGHT / board.length / 6}vh, ${90 / board.length / 6}vw);
            }
        }`);
}
let downButton = -1, paintColor = -1;
document.body.addEventListener("pointerup", function () {
    downButton = -1;
});
document.body.addEventListener("pointerleave", function () {
    downButton = -1;
});
function isNonTargetInput(node) {
    let matchTarget = false;
    for (let targetCoord of TUTORIAL.steps[tutorialStep].target)
        if (targetCoord.x == Number(node.dataset.x) && targetCoord.y == Number(node.dataset.y)) {
            matchTarget = true;
            break;
        }
    if (!matchTarget)
        return true;
    else
        return false;
}
function checkTutorialTarget() {
    if (tutorialStep >= 0 && tutorialStep < TUTORIAL.steps.length && TUTORIAL.steps[tutorialStep].target) {
        let targetFulfilled = true;
        for (let i of TUTORIAL.steps[tutorialStep].target) {
            if ((i.color == 0 && !(lockedGrids[i.x][i.y] && userAnswer[i.x][i.y] == 0)) || (i.color == 1 && userAnswer[i.x][i.y] != 1)) {
                targetFulfilled = false;
                break;
            }
        }
        if (targetFulfilled) {
            tutorialStep++;
            if (tutorialStep < TUTORIAL.steps.length)
                loadTutorial(tutorialStep);
        }
    }
}
function paint(element, isMouseDown) {
    if (lockedGrids[Number(element.dataset.x)][Number(element.dataset.y)])
        return;
    if (userAnswer[Number(element.dataset.x)][Number(element.dataset.y)] == 1 && (isMouseDown || paintColor == 0)) {
        userAnswer[Number(element.dataset.x)][Number(element.dataset.y)] = 0;
        paintColor = 0;
        element.classList.remove("black");
        element.classList.add("white");
    }
    else if (userAnswer[Number(element.dataset.x)][Number(element.dataset.y)] == 0 && (isMouseDown || paintColor == 1)) {
        userAnswer[Number(element.dataset.x)][Number(element.dataset.y)] = 1;
        paintColor = 1;
        element.classList.remove("white");
        element.classList.add("black");
    }
}
function generatePuzzle(answer, ends, mode) {
    let puzzleNumber = generateBoard(answer.length, 0);
    let given = generateBoard(answer.length, -1);
    let solutions = solve(ends, puzzleNumber).solutions;
    let tempSolutions = [];
    let hasMatch = false;
    for (let solution of solutions) {
        let solutionMatchesAnswer = true;
        if (!hasMatch) {
            let isReversed = -1;
            outerFor: for (let i = 0; i < answer.length; i++) {
                for (let j = 0; j < answer.length; j++) {
                    if (!(solution.board[i][j] == -1 || (isReversed == 0 && answer[i][j] == solution.board[i][j]) || (isReversed == 1 && answer[i][j] != solution.board[i][j]) || isReversed == -1)) {
                        solutionMatchesAnswer = false;
                        break outerFor;
                    }
                    if (isReversed == -1) {
                        if (solution.board[i][j] != -1)
                            isReversed = Number(!(answer[i][j] == solution.board[i][j]));
                    }
                }
            }
        }
        else
            solutionMatchesAnswer = false;
        let possibilities = [structuredClone(solution.board)];
        if (solutionMatchesAnswer) {
            hasMatch = true;
            for (let i = 0; i < answer.length; i++)
                for (let j = 0; j < answer.length; j++) {
                    if (solution.board[i][j] == -1) {
                        let tempPossibilities = [];
                        for (let possibility of possibilities) {
                            let tempBoard1 = structuredClone(possibility), tempBoard2 = structuredClone(possibility);
                            tempBoard1[i][j] = 0;
                            tempBoard2[i][j] = 1;
                            tempPossibilities.push(tempBoard1, tempBoard2);
                        }
                        possibilities = structuredClone(tempPossibilities);
                    }
                }
            console.log("possibilities", structuredClone(possibilities));
        }
        tempSolutions.push(...possibilities);
        for (let possibility of possibilities) {
            let reversedBoard = structuredClone(possibility);
            for (let i = 0; i < reversedBoard.length; i++)
                for (let j = 0; j < reversedBoard.length; j++) {
                    if (reversedBoard[i][j] != -1)
                        reversedBoard[i][j] = Number(!reversedBoard[i][j]);
                }
            tempSolutions.push(reversedBoard);
        }
    }
    let answerNumber = generateBoard(answer.length, 0);
    for (let i = 0; i < answer.length; i++)
        for (let j = 0; j < answer.length; j++) {
            answerNumber[i][j] = getNumber(answer, {
                "x": i,
                "y": j
            }).counterMin;
        }
    if (mode == "fairy") {
        while (tempSolutions.length > 1) {
            let sameToAnswer = generateBoard(answer.length, 0);
            for (let solution of tempSolutions) {
                for (let i = 0; i < solution.length; i++)
                    for (let j = 0; j < solution.length; j++) {
                        if (ends[i][j] || answerNumber[i][j] == 0 ||
                            answerNumber[i][j] + Number(i == 0 || i == answer.length - 1) + Number(j == 0 || j == answer.length - 1) == 4)
                            continue;
                        let number = getNumber(solution, {
                            "x": i,
                            "y": j
                        });
                        if (number.counterMin <= answerNumber[i][j] && answerNumber[i][j] <= number.counterMax)
                            sameToAnswer[i][j]++;
                    }
            }
            let hits = [];
            for (let i of sameToAnswer)
                for (let j of i)
                    if (j > 0)
                        hits.push(j);
            let minHits = Math.min(...hits);
            if (minHits == tempSolutions.length) {
                while (tempSolutions.length > 1) {
                    addGiven(tempSolutions, answer, sameToAnswer, given);
                }
                break;
            }
            outerFor: for (let i = 0; i < sameToAnswer.length; i++) {
                for (let j = 0; j < sameToAnswer.length; j++) {
                    if (sameToAnswer[i][j] == minHits) {
                        puzzleNumber[i][j] = answerNumber[i][j];
                        for (let solutionIndex = 0; solutionIndex < tempSolutions.length; solutionIndex++) {
                            if (!tempSolutions[solutionIndex])
                                break;
                            let number = getNumber(tempSolutions[solutionIndex], {
                                "x": i,
                                "y": j
                            });
                            if (number.counterMax < puzzleNumber[i][j] || number.counterMin > puzzleNumber[i][j]) {
                                tempSolutions.splice(solutionIndex, 1);
                                solutionIndex--;
                            }
                        }
                        break outerFor;
                    }
                }
            }
        }
    }
    else {
        let sameToAnswer = generateBoard(answer.length, 0);
        while (tempSolutions.length > 1) {
            addGiven(tempSolutions, answer, sameToAnswer, given);
        }
    }
    console.log(structuredClone(tempSolutions));
    return {
        "given": given,
        "numbers": puzzleNumber
    };
}
function addGiven(tempSolutions, answer, sameToAnswer, given) {
    for (let solution of tempSolutions) {
        for (let i = 0; i < solution.length; i++)
            for (let j = 0; j < solution.length; j++) {
                if (solution[i][j] == -1 || solution[i][j] == answer[i][j])
                    sameToAnswer[i][j]++;
            }
    }
    let minHits = Math.min(...sameToAnswer.flat(2));
    outerFor2: for (let i = 0; i < sameToAnswer.length; i++) {
        for (let j = 0; j < sameToAnswer.length; j++)
            if (sameToAnswer[i][j] == minHits) {
                given[i][j] = answer[i][j];
                for (let solutionIndex = 0; solutionIndex < tempSolutions.length; solutionIndex++) {
                    if (!tempSolutions[solutionIndex])
                        break;
                    if (tempSolutions[solutionIndex][i][j] != -1 && tempSolutions[solutionIndex][i][j] != answer[i][j]) {
                        tempSolutions.splice(solutionIndex, 1);
                        solutionIndex--;
                    }
                }
                break outerFor2;
            }
    }
}
function getNumber(board, coord) {
    let counterMin = 0, counterMax = 0;
    for (let dir of DIRECTIONS) {
        if (coord.x + dir.x < 0 || coord.x + dir.x >= board.length || coord.y + dir.y < 0 || coord.y + dir.y >= board.length)
            continue;
        else if (board[coord.x + dir.x][coord.y + dir.y] == 1) {
            counterMin++;
            counterMax++;
        }
        else if (board[coord.x + dir.x][coord.y + dir.y] == -1)
            counterMax++;
    }
    return {
        "counterMin": counterMin,
        "counterMax": counterMax
    };
}
function solve(ends, numbers) {
    let numberList = [];
    for (let i = 0; i < numbers.length; i++)
        for (let j = 0; j < numbers.length; j++) {
            if (numbers[i][j] != 0)
                numberList.push({
                    "x": i,
                    "y": j,
                    "number": numbers[i][j]
                });
        }
    let endsList = [], branches = [], solutions = [];
    for (let i = 0; i < ends.length; i++)
        for (let j = 0; j < ends.length; j++)
            if (ends[i][j])
                endsList.push({
                    "x": i,
                    "y": j
                });
    let endIndex2 = 0;
    let board = generateBoard(ends.length, -1);
    board[endsList[endIndex2].x][endsList[endIndex2].y] = 1;
    branches.push({
        "board": board,
        "branches": [],
        "pathCoords": [endsList[endIndex2]],
        "usedEnds": []
    });
    exploreFuturePaths(branches[branches.length - 1], ends, solutions);
    removeInvalidSolutions(solutions, endsList);
    while (solutions[0].usedEnds.length < endsList.length) {
        branches = [];
        let tempSolutions = structuredClone(solutions);
        solutions = [];
        solutions = iterateSolution(tempSolutions, endsList, ends);
    }
    return {
        "solutions": solutions,
        "branches": branches
    };
}
function removeInvalidSolutions(solutions, endsList) {
    for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
        if (!solutions[solutionIndex])
            break;
        let regions = getRegions(solutions[solutionIndex].board);
        for (let end of endsList) {
            let region = getRegion(regions, end);
            if (solutions[solutionIndex].board[end.x][end.y] != -1 && (!region.isLine
                || (!(region.ends[0].x == end.x && region.ends[0].y == end.y)
                    && !(region.ends[1].x == end.x && region.ends[1].y == end.y)))) {
                solutions.splice(solutionIndex, 1);
                solutionIndex--;
                break;
            }
        }
    }
}
function iterateSolution(tempSolutions, endsList, ends) {
    let solutions = [], branches = [];
    for (let tempSolution of tempSolutions) {
        let endIndex2 = 0;
        outerFor: for (;; endIndex2++) {
            for (let usedEnd of tempSolution.usedEnds)
                if (usedEnd.x == endsList[endIndex2].x && usedEnd.y == endsList[endIndex2].y)
                    continue outerFor;
            break;
        }
        let board = tempSolution.board;
        let colorList = [];
        if (board[endsList[endIndex2].x][endsList[endIndex2].y] != -1)
            colorList = [board[endsList[endIndex2].x][endsList[endIndex2].y]];
        else
            colorList = [0, 1];
        for (let color of colorList) {
            let tempBoard = structuredClone(board);
            tempBoard[endsList[endIndex2].x][endsList[endIndex2].y] = color;
            branches.push({
                "board": tempBoard,
                "branches": [],
                "pathCoords": [endsList[endIndex2]],
                "usedEnds": tempSolution.usedEnds
            });
            exploreFuturePaths(branches[branches.length - 1], ends, solutions);
        }
    }
    removeInvalidSolutions(solutions, endsList);
    return solutions;
}
function exploreFuturePaths({ "board": board, "branches": branches, "pathCoords": pathCoords, "usedEnds": usedEnds }, ends, solutions) {
    let coord = {
        "x": pathCoords[pathCoords.length - 1].x,
        "y": pathCoords[pathCoords.length - 1].y
    };
    let color = board[pathCoords[0].x][pathCoords[0].y];
    let dirAvailable = [];
    for (let j of DIRECTIONS) {
        if (coord.x + j.x < 0 || coord.x + j.x >= board.length || coord.y + j.y >= board.length || coord.y + j.y < 0)
            continue;
        if (checkGridAvailability(board, {
            "x": coord.x + j.x,
            "y": coord.y + j.y
        }, pathCoords))
            dirAvailable.push(j);
    }
    if (dirAvailable.length) {
        outerFor: for (let dir of dirAvailable) {
            coord.x = pathCoords[pathCoords.length - 1].x + dir.x;
            coord.y = pathCoords[pathCoords.length - 1].y + dir.y;
            let tempPathCoords = structuredClone(pathCoords);
            tempPathCoords.push(structuredClone(coord));
            let tempBoard = structuredClone(board);
            tempBoard[coord.x][coord.y] = color;
            let lastCoord = tempPathCoords[tempPathCoords.length - 2];
            for (let j of DIRECTIONS) {
                if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= board.length || lastCoord.y + j.y >= board.length || lastCoord.y + j.y < 0)
                    continue;
                if (tempBoard[lastCoord.x + j.x][lastCoord.y + j.y] != color)
                    tempBoard[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
                checkOShape(tempBoard);
            }
            branches.push({
                "board": tempBoard,
                "branches": [],
                "pathCoords": tempPathCoords,
                "usedEnds": usedEnds
            });
            let regions = getRegions(tempBoard);
            for (let i = 0; i < ends.length; i++)
                for (let j = 0; j < ends.length; j++)
                    if (ends[i][j]) {
                        let region = getRegion(regions, {
                            "x": i,
                            "y": j
                        });
                        if (tempBoard[i][j] != -1 && (!region.isLine
                            || (!(region.ends[0].x == i && region.ends[0].y == j)
                                && !(region.ends[1].x == i && region.ends[1].y == j)))) {
                            continue outerFor;
                        }
                    }
            if (!ends[coord.x][coord.y]) {
                exploreFuturePaths(branches[branches.length - 1], ends, solutions);
            }
            else {
                let lastCoord = tempPathCoords[tempPathCoords.length - 1];
                for (let j of DIRECTIONS) {
                    if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= board.length || lastCoord.y + j.y >= board.length || lastCoord.y + j.y < 0)
                        continue;
                    if (tempBoard[lastCoord.x + j.x][lastCoord.y + j.y] != color)
                        tempBoard[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
                }
                checkOShape(tempBoard);
                solutions.push({
                    "board": tempBoard,
                    "usedEnds": [...usedEnds, tempPathCoords[0], lastCoord]
                });
            }
        }
    }
}
for (let i of document.querySelectorAll("[data-for]")) {
    i.addEventListener("pointerdown", function () {
        document.querySelector(".active").classList.remove("active");
        document.querySelector(`[data-id="${i.dataset.for}"]`).classList.add("active");
    });
}
let answerBoard = {
    "board": [],
    "ends": []
}, puzzle = {
    "numbers": [],
    "given": []
}, userAnswer = [], lockedGrids = [];
function newGame(mode, size, isTodaysPuzzle) {
    tutorialStep = -1;
    document.getElementById("game").classList.remove("tutorial");
    generator = generateRand();
    document.getElementById("checkButton").classList.add("show");
    document.getElementById("goodContainer").classList.remove("show");
    answerBoard = generateAnswer(size, isTodaysPuzzle);
    console.log("generatePuzzle", structuredClone(answerBoard.board), structuredClone(answerBoard.ends), mode);
    let date = new Date();
    puzzle = generatePuzzle(answerBoard.board, answerBoard.ends, mode);
    console.log(Number(new Date()) - Number(date));
    userAnswer = structuredClone(puzzle.given);
    lockedGrids = generateBoard(size, false);
    for (let i = 0; i < userAnswer.length; i++)
        for (let j = 0; j < userAnswer.length; j++) {
            if (userAnswer[i][j] == -1)
                userAnswer[i][j] = 0;
        }
    renderBoard(userAnswer, answerBoard.ends, puzzle.numbers, puzzle.given);
    document.getElementById("gameTitle").innerText = MODE_NAMES[mode] + " " + SIZE_NAMES[size];
}
for (let i of document.querySelectorAll(".new-game")) {
    i.addEventListener("pointerdown", function () {
        newGame(i.dataset.mode, Number(i.dataset.size), Boolean(Number(i.dataset.isTodaysPuzzle)));
        addEventsForGrids();
    });
}
function addEventsForGrids() {
    for (let childNode of document.getElementById("board").childNodes) {
        childNode.addEventListener("pointerdown", function (e) {
            if (puzzle.given[Number(childNode.dataset.x)][Number(childNode.dataset.y)] != -1)
                return;
            if (tutorialStep >= 0 && tutorialStep < TUTORIAL.steps.length) {
                if (!TUTORIAL.steps[tutorialStep].target) {
                    tutorialStep++;
                    if (tutorialStep < TUTORIAL.steps.length)
                        loadTutorial(tutorialStep);
                    return;
                }
                else {
                    if (isNonTargetInput(childNode))
                        return;
                }
            }
            downButton = e.button;
            if (e.button == 0) {
                paint(childNode, true);
            }
            else if (e.button == 2) {
                lockedGrids[Number(childNode.dataset.x)][Number(childNode.dataset.y)] = !lockedGrids[Number(childNode.dataset.x)][Number(childNode.dataset.y)];
                if (lockedGrids[Number(childNode.dataset.x)][Number(childNode.dataset.y)])
                    childNode.classList.add("locked");
                else
                    childNode.classList.remove("locked");
            }
            checkTutorialTarget();
        });
        childNode.addEventListener("pointerenter", function () {
            if (puzzle.given[Number(childNode.dataset.x)][Number(childNode.dataset.y)] != -1)
                return;
            if (downButton == 0) {
                if (tutorialStep >= 0 && tutorialStep < TUTORIAL.steps.length && isNonTargetInput(childNode))
                    return;
                paint(childNode, false);
                checkTutorialTarget();
            }
        });
        childNode.oncontextmenu = (e) => {
            e.preventDefault();
        };
    }
}
document.getElementById("theme").addEventListener("pointerdown", function () {
    let newTheme = THEME_LIST[(THEME_LIST.indexOf(document.body.classList[0]) + 1) % THEME_LIST.length];
    document.body.classList.value = "";
    document.body.classList.add(newTheme);
    document.querySelector("#theme .value").innerText = THEME_NAMES[newTheme];
});
document.getElementById("checkButton").addEventListener("pointerdown", function () {
    let isCorrect = true;
    if (hasOShape(userAnswer))
        isCorrect = false;
    else {
        let regions = getRegions(userAnswer);
        outerFor: for (let i = 0; i < userAnswer.length; i++) {
            for (let j = 0; j < userAnswer.length; j++)
                if (answerBoard.ends[i][j]) {
                    let region = getRegion(regions, {
                        "x": i,
                        "y": j
                    });
                    if (!region.isLine
                        || !answerBoard.ends[region.ends[0].x][region.ends[0].y]
                        || !answerBoard.ends[region.ends[1].x][region.ends[1].y]) {
                        isCorrect = false;
                        break outerFor;
                    }
                }
        }
    }
    if (isCorrect) {
        document.getElementById("checkButton").classList.remove("show");
        document.getElementById("goodContainer").classList.add("show");
    }
});
function hasOShape(board) {
    for (let i = 0; i < board.length - 1; i++)
        for (let j = 0; j < board.length - 1; j++) {
            if (board[i][j] == board[i + 1][j] && board[i][j] == board[i][j + 1] && board[i][j] == board[i + 1][j + 1]) {
                return true;
            }
        }
    return false;
}
function* generateRand() {
    let a = NUMBERS[DATE.getDate()];
    let b = NUMBERS[DATE.getMonth()];
    let c = 123450000 + DATE.getFullYear();
    let i = 1;
    while (true) {
        yield ((a * i + b) % c) / c;
        i++;
    }
}
let generator;
function rand() {
    return generator.next().value;
}
const TUTORIAL = {
    "board": generateBoard(4, 0),
    "ends": [
        [true, true, false, false],
        [false, false, false, true],
        [true, false, false, false],
        [false, false, true, true]
    ],
    "numbers": [
        [0, 0, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    "given": [
        [-1, -1, -1, 0],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1]
    ],
    "userAnswer": generateBoard(4, 0),
    "answer": [
        [0, 1, 1, 0],
        [0, 0, 1, 1],
        [1, 0, 0, 0],
        [1, 1, 1, 0]
    ],
    "steps": [{
            "step": "Let's get started.<br/>Tap these tiles to make them black.",
            "highlight": [{
                    "x": 0,
                    "y": 2
                }, {
                    "x": 1,
                    "y": 3
                }],
            "target": [{
                    "x": 0,
                    "y": 2,
                    "color": 1
                }, {
                    "x": 1,
                    "y": 3,
                    "color": 1
                }]
        }, {
            "step": "\"2\" indicates that there are 2 black tiles in its horizontally or vertically neighboring tiles.",
            "highlight": [{
                    "x": 0,
                    "y": 2
                }]
        }, {
            "step": "Among its neighbors, this tile is marked with a solid triangle and therefore cannot be changed.",
            "highlight": [{
                    "x": 0,
                    "y": 3
                }]
        }, {
            "step": "So just tap on these two tiles.",
            "highlight": [{
                    "x": 0,
                    "y": 1
                }, {
                    "x": 1,
                    "y": 2
                }],
            "target": [{
                    "x": 0,
                    "y": 1,
                    "color": 1
                }, {
                    "x": 1,
                    "y": 2,
                    "color": 1
                }]
        }, {
            "step": "2x2 areas of same color are not allowed.<br/>Right-click to lock a tile.",
            "highlight": [{
                    "x": 0,
                    "y": 1
                }, {
                    "x": 0,
                    "y": 2
                }, {
                    "x": 1,
                    "y": 1
                }, {
                    "x": 1,
                    "y": 2
                }],
            "target": [{
                    "x": 1,
                    "y": 1,
                    "color": 0
                }]
        }, {
            "step": "As you can see, these four black tiles now forms a path, starting and ending with a circle tile respectively.",
            "highlight": [{
                    "x": 0,
                    "y": 1
                }, {
                    "x": 0,
                    "y": 2
                }, {
                    "x": 1,
                    "y": 2
                }, {
                    "x": 1,
                    "y": 3
                }]
        }, {
            "step": "To \"protect\" the path, they must remain white.<br/>Lock these tiles.",
            "highlight": [{
                    "x": 0,
                    "y": 0
                }, {
                    "x": 2,
                    "y": 2
                }, {
                    "x": 2,
                    "y": 3
                }],
            "target": [{
                    "x": 0,
                    "y": 0,
                    "color": 0
                }, {
                    "x": 2,
                    "y": 2,
                    "color": 0
                }, {
                    "x": 2,
                    "y": 3,
                    "color": 0
                }]
        }, {
            "step": "Paths can be either black or white. Since this circle tile is white, it must belong to a white path.",
            "highlight": [{
                    "x": 0,
                    "y": 0
                }]
        }, {
            "step": "To connect the circle with another one, we need to guide it out.<br/>So this tile's color should be...",
            "highlight": [{
                    "x": 1,
                    "y": 0
                }],
            "target": [{
                    "x": 1,
                    "y": 0,
                    "color": 0
                }]
        }, {
            "step": "Subsequently, you should know what to do with these two tiles...",
            "highlight": [{
                    "x": 2,
                    "y": 1
                }, {
                    "x": 3,
                    "y": 3
                }],
            "target": [{
                    "x": 2,
                    "y": 1,
                    "color": 0
                }, {
                    "x": 3,
                    "y": 3,
                    "color": 0
                }]
        }, {
            "step": "Can you figure the rest out on your own?<br/>When you're done, click on the check button.",
            "highlight": [{
                    "x": 2,
                    "y": 0
                }, {
                    "x": 3,
                    "y": 0
                }, {
                    "x": 3,
                    "y": 1
                }, {
                    "x": 3,
                    "y": 2
                }],
            "target": [{
                    "x": 2,
                    "y": 0,
                    "color": 1
                }, {
                    "x": 3,
                    "y": 0,
                    "color": 1
                }, {
                    "x": 3,
                    "y": 1,
                    "color": 1
                }, {
                    "x": 3,
                    "y": 2,
                    "color": 1
                }]
        }]
};
let tutorialStep = -1;
function startTutorial() {
    document.getElementById("game").classList.add("tutorial");
    document.getElementById("gameTitle").innerText = "How to Play";
    document.getElementById("checkButton").classList.add("show");
    document.getElementById("goodContainer").classList.remove("show");
    answerBoard = {
        "board": TUTORIAL.answer,
        "ends": TUTORIAL.ends
    };
    puzzle = {
        "given": TUTORIAL.given,
        "numbers": TUTORIAL.numbers
    };
    userAnswer = structuredClone(TUTORIAL.userAnswer);
    lockedGrids = generateBoard(4, false);
    renderBoard(TUTORIAL.board, TUTORIAL.ends, TUTORIAL.numbers, TUTORIAL.given);
    addEventsForGrids();
    tutorialStep = 0;
    loadTutorial(tutorialStep);
}
function loadTutorial(stepIndex) {
    for (let j of document.querySelectorAll(".highlight"))
        j.classList.remove("highlight");
    document.getElementById("tutorialText").innerHTML = TUTORIAL.steps[stepIndex].step;
    for (let j of TUTORIAL.steps[stepIndex].highlight) {
        document.querySelector(`[data-x="${j.x}"][data-y="${j.y}"]`).classList.add("highlight");
    }
}
document.getElementById("howToPlay").addEventListener("pointerdown", function () {
    startTutorial();
});
