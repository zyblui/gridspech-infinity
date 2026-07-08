const BOARD_HEIGHT = 70;
let boardSize = 4;
function generateBoard(size, value) {
    let arr = [], tempArr = [];
    for (let i = 0; i < size; i++) tempArr.push(value);
    for (let i = 0; i < size; i++) arr.push(structuredClone(tempArr));
    return arr;
}
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
function checkGridAvailability(board, coord, pathCoords, ends = [], finishCoord = { "x": -1, "y": -1 }) {
    if (ends.length && ends[coord.x][coord.y] && !(finishCoord.x == coord.x && finishCoord.y == coord.y)) return false;
    if (board[coord.x][coord.y] == Number(!board[pathCoords[0].x][pathCoords[0].y])) return false;
    for (let i of pathCoords) if (i.x == coord.x && i.y == coord.y) return false;
    let tempBoard = structuredClone(board);
    tempBoard[coord.x][coord.y] = tempBoard[pathCoords[0].x][pathCoords[0].y];
    let regions = getRegions(tempBoard);
    return getRegion(regions, pathCoords[0]).isLine;
}

function generateAnswer(size) {
    let board = generateBoard(size, -1);
    let ends = generateBoard(size, false);
    let length = Infinity;//Math.floor(Math.random() * size * 2) + 2;
    let pathCoords = [];
    let coord = {
        "x": Math.floor(Math.random() * size),
        "y": Math.floor(Math.random() * size)
    };
    pathCoords.push(structuredClone(coord));
    let color = Math.round(Math.random());
    board[coord.x][coord.y] = color;
    ends[coord.x][coord.y] = true;
    for (let i = 0; i < length; i++) {
        let dirAvailable = [];
        for (let j of DIRECTIONS) {
            if (coord.x + j.x < 0 || coord.x + j.x >= size || coord.y + j.y >= size || coord.y + j.y < 0) continue;
            if (checkGridAvailability(board, {
                "x": coord.x + j.x,
                "y": coord.y + j.y
            }, pathCoords)) dirAvailable.push(j);
        }
        if (dirAvailable.length) {
            let dir = dirAvailable[Math.floor(Math.random() * dirAvailable.length)];
            coord.x = coord.x + dir.x;
            coord.y = coord.y + dir.y;
            pathCoords.push(structuredClone(coord));
            board[coord.x][coord.y] = color;
            let lastCoord = pathCoords[pathCoords.length - 2];
            for (let j of DIRECTIONS) {
                if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= size || lastCoord.y + j.y >= size || lastCoord.y + j.y < 0) continue;
                if (board[lastCoord.x + j.x][lastCoord.y + j.y] != color) board[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
                checkOShape(board);
            }
        } else break;
    }
    let lastCoord = pathCoords[pathCoords.length - 1];
    for (let j of DIRECTIONS) {
        if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= size || lastCoord.y + j.y >= size || lastCoord.y + j.y < 0) continue;
        if (board[lastCoord.x + j.x][lastCoord.y + j.y] != color) board[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
    }
    ends[lastCoord.x][lastCoord.y] = true;
    checkOShape(board);
    let regions = getRegions(board);
    getRegion(regions, lastCoord).finished = true;
    let hasUnfilledGrids = true;
    while (hasUnfilledGrids) {
        for (let i of regions) {
            if (!i.finished && i.isLine) {
                for (let end of i.ends) {
                    expandRegion(board, end, Infinity);
                    i.finished = true;
                }
                break;
            }
        }
        let regions2 = getRegions(board);
        for (let i of regions) {
            if (i.finished) getRegion(regions2, i.grids[0]).finished = true;
        }
        regions = structuredClone(regions2);
        hasUnfilledGrids = false;
        for (let i of board) for (let j of i) if (j == -1) {
            hasUnfilledGrids = true;
        }
        if (!hasUnfilledGrids) for (let j of regions) if (j.isLine && j.grids.length > 1) {
            ends[j.ends[0].x][j.ends[0].y] = true;
            ends[j.ends[1].x][j.ends[1].y] = true;
        }
    }
    return {
        "board": board,
        "ends": ends
    };
}
function reverse(arr) {
    let arr2 = [];
    for (let i of arr) arr2.unshift(i);
    return arr;
}
function expandRegion(board, startCoord, length) {
    if (!getRegion(getRegions(board), startCoord).isLine) {
        return;
    }

    let pathCoords = [];
    let coord = structuredClone(startCoord);
    let regions = getRegions(board);
    pathCoords = getRegion(regions, startCoord).grids;

    if (pathCoords[pathCoords.length - 1].x != startCoord.x || pathCoords[pathCoords.length - 1].y != startCoord.y) pathCoords = reverse(pathCoords);

    let color = board[startCoord.x][startCoord.y];

    for (let i of pathCoords) {
        if ((i.x == getRegion(regions, startCoord).ends[0].x && i.y == getRegion(regions, startCoord).ends[0].y) || (i.x ==
            getRegion(regions, startCoord).ends[1].x && i.y == getRegion(regions, startCoord).ends[1].y)) continue;
        for (let j of DIRECTIONS) {
            if (i.x + j.x < 0 || i.x + j.x >= board.length || i.y + j.y >= board.length || i.y + j.y < 0) continue;
            if (board[i.x + j.x][i.y + j.y] != color) board[i.x + j.x][i.y + j.y] = Number(!color);
        }
        checkOShape(board);
    }
    if (!getRegion(getRegions(board), startCoord).isLine) {
        return;
    }
    board[coord.x][coord.y] = color;
    for (let i = 0; i < length; i++) {
        let dirAvailable = [];
        for (let j of DIRECTIONS) {
            if (coord.x + j.x < 0 || coord.x + j.x >= board.length || coord.y + j.y >= board.length || coord.y + j.y < 0) continue;
            if (checkGridAvailability(board, {
                "x": coord.x + j.x,
                "y": coord.y + j.y
            }, pathCoords)) dirAvailable.push(j);
        }
        if (dirAvailable.length) {
            let dir = dirAvailable[Math.floor(Math.random() * dirAvailable.length)];
            coord.x = coord.x + dir.x;
            coord.y = coord.y + dir.y;
            pathCoords.push(structuredClone(coord));
            board[coord.x][coord.y] = color;
            let lastCoord = pathCoords[pathCoords.length - 2];
            for (let j of DIRECTIONS) {
                if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= board.length || lastCoord.y + j.y >= board.length || lastCoord.y + j.y < 0) continue;
                if (board[lastCoord.x + j.x][lastCoord.y + j.y] != color) board[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
                checkOShape(board);
            }
        } else break;
    }
    let lastCoord = pathCoords[pathCoords.length - 1];
    for (let j of DIRECTIONS) {
        if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= board.length || lastCoord.y + j.y >= board.length || lastCoord.y + j.y < 0) continue;
        if (board[lastCoord.x + j.x][lastCoord.y + j.y] != color) board[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
    }
    if (!getRegion(getRegions(board), startCoord).isLine) {
        return;
    }
    checkOShape(board);
}
function checkOShape(board) {
    for (let i = 0; i < board.length; i++)for (let j = 0; j < board.length; j++) {
        if (board[i][j] == -1) continue;
        for (let dimension1 of [DIRECTIONS[0], DIRECTIONS[1]]) for (let dimension2 of [DIRECTIONS[2], DIRECTIONS[3]]) {
            if (i + dimension1.x < 0 || i + dimension1.x >= board.length || j + dimension2.y >= board.length || j + dimension2.y < 0) continue;
            if (board[i][j] == board[i + dimension1.x][j] && board[i][j] == board[i][j + dimension2.y]) board[i + dimension1.x][j + dimension2.y] = Number(!board[i][j]);
        }
    }
}
function getRegions(board) {
    let regions = [];
    for (let i = 0; i < board.length; i++) for (let j = 0; j < board.length; j++) {
        if (board[i][j] == -1) continue;
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
    for (let i = 0; i < board.length; i++) for (let j = 0; j < board.length; j++) {
        if (board[i][j] == -1) continue;
        for (let dir of DIRECTIONS) {
            if (i + dir.x >= 0 && i + dir.x < board.length && j + dir.y >= 0 && j + dir.y < board.length && board[i + dir.x][j + dir.y] == board[i][j]) {
                let region1Index = 0, region2Index = 0;
                for (; region1Index < regions.length; region1Index++) {
                    if (gridIndexOf(regions[region1Index].grids, {
                        "x": i,
                        "y": j
                    }) != -1) break;
                }
                for (; region2Index < regions.length; region2Index++) {
                    if (gridIndexOf(regions[region2Index].grids, {
                        "x": i + dir.x,
                        "y": j + dir.y
                    }) != -1) break;
                }
                if (region1Index != region2Index) {
                    merge(regions, region1Index, region2Index);
                }
            }
        }
    }
    return regions;
}
function merge(regions, region1Index, region2Index) {
    if (region1Index == region2Index) return;
    let combinedIsLine = false;
    if (!(regions[region1Index].isLine && regions[region2Index].isLine)) {
        regions[region1Index].isLine = false;
        regions[region1Index].ends = [];
    } else {
        if (regions[region1Index].ends[0].x == regions[region1Index].ends[1].x && regions[region1Index].ends[0].y == regions[region1Index]
            .ends[1].y && regions[region2Index].ends[0].x == regions[region2Index].ends[1].x && regions[region2Index].ends[0].y ==
            regions[region2Index].ends[1].y
            && Math.abs(regions[region1Index].ends[0].x - regions[region2Index].ends[0].x) + Math.abs(regions[region1Index].ends[0].y -
                regions[region2Index].ends[0].y) == 1) {
            regions[region1Index].isLine = true;
            regions[region1Index].ends = [regions[region1Index].ends[0], regions[region2Index].ends[0]];
            combinedIsLine = true;
        } else outerFor: for (let i of [0, 1]) {
            for (let j of [0, 1]) {
                if (Math.abs(regions[region1Index].ends[i].x - regions[region2Index].ends[j].x) + Math.abs(regions[region1Index].ends[i].y -
                    regions[region2Index].ends[j].y) == 1 && Math.abs(regions[region1Index].ends[Number(!i)].x - regions[region2Index]
                        .ends[Number(!j)].x) + Math.abs(regions[region1Index].ends[Number(!i)].y - regions[region2Index].ends[Number(!j)].y) > 1) {
                    regions[region1Index].isLine = true;
                    regions[region1Index].ends = [regions[region1Index].ends[Number(!i)], regions[region2Index].ends[Number(!j)]];
                    combinedIsLine = true;
                    break outerFor;
                }
            }
        }
        if (combinedIsLine) {
            let neighbors = 0;
            for (let region1Grid of regions[region1Index].grids) for (let region2Grid of regions[region2Index].grids) {
                if (Math.abs(region1Grid.x - region2Grid.x) + Math.abs(region1Grid.y - region2Grid.y) == 1) neighbors++;
            }
            if (neighbors != 1) combinedIsLine = false;
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
        for (let num = 0; num < regions[region1Index].grids.length - 1; num++) for (let i of regions[region1Index].grids) {
            if (Math.abs(i.x - arr[arr.length - 1].x) + Math.abs(i.y - arr[arr.length - 1].y) == 1 && gridIndexOf(arr, i) == -1) arr.push(i);
        }
        regions[region1Index].grids = arr;
    }
    regions.splice(region2Index, 1);
}
function gridIndexOf(coordGroup, coord) {
    for (let i = 0; i < coordGroup.length; i++) if (coordGroup[i].x == coord.x && coordGroup[i].y == coord.y) return i;
    return -1;
}
function getRegion(regions, coord) {
    for (let region of regions) for (let grid of region.grids) if (grid.x == coord.x && grid.y == coord.y) return region;
}
let stylesheet = new CSSStyleSheet();
document.adoptedStyleSheets.push(stylesheet);
function renderBoard(board, ends, numbers, given) {
    document.getElementById("board").innerHTML = "";
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let grid = document.createElement("div");
            grid.classList.add("grid");
            if (board[i][j] == 0) grid.classList.add("white");
            else if (board[i][j] == 1) grid.classList.add("black");
            if (ends[i][j]) grid.classList.add("end");
            if (numbers[i][j] != 0) grid.innerText = numbers[i][j];
            grid.dataset.x = i;
            grid.dataset.y = j;
            if (given[i][j] != -1) grid.classList.add("given");
            document.getElementById("board").appendChild(grid);
        }
    }

    document.getElementById("board").dataset.size = board.length;
    document.getElementById("board").style.gridTemplateColumns = `repeat(${board.length}, 1fr)`;
    document.getElementById("board").style.gridTemplateRows = `repeat(${board.length}, 1fr)`;
    document.getElementById("board").style.fontSize = `min(${BOARD_HEIGHT / board.length * 2 / 3}vh, ${90 / board.length * 2 / 3}vw)`;
    if (stylesheet.cssRules.length) stylesheet.deleteRule(0);
    stylesheet.insertRule(
        `#board .grid {
            line-height: min(${BOARD_HEIGHT / board.length}vh, ${90 / board.length}vw);
            &.end::before {
                border-width: min(${BOARD_HEIGHT / board.length / 6 * 2 / 3}vh, ${90 / board.length / 6 * 2 / 3}vw);
            }
            &.given::after, &.locked::after {
                width: min(${BOARD_HEIGHT / board.length / 6}vh, ${90 / board.length / 6}vw);
                height: min(${BOARD_HEIGHT / board.length / 6}vh, ${90 / board.length / 6}vw);
            }
        }`
    );
}

let downButton = -1, paintColor = -1;
document.querySelector("body").addEventListener("mouseup", function () {
    downButton = -1;
});
document.querySelector("body").addEventListener("mouseleave", function () {
    downButton = -1;
});
function paint(element, isMouseDown) {
    if (lockedGrids[Number(element.dataset.x)][Number(element.dataset.y)]) return;
    if (userAnswer[Number(element.dataset.x)][Number(element.dataset.y)] == 1 && (isMouseDown || paintColor == 0)) {
        userAnswer[Number(element.dataset.x)][Number(element.dataset.y)] = 0;
        paintColor = 0;
        element.classList.remove("black");
        element.classList.add("white");
    } else if (userAnswer[Number(element.dataset.x)][Number(element.dataset.y)] == 0 && (isMouseDown || paintColor == 1)) {
        userAnswer[Number(element.dataset.x)][Number(element.dataset.y)] = 1;
        paintColor = 1;
        element.classList.remove("white");
        element.classList.add("black");
    }
}
function generatePuzzle(answer, ends, mode) {
    let puzzleNumber = generateBoard(answer.length, 0);
    let given = generateBoard(answer.length, -1);
    let solutions = solve(answerBoard.ends, puzzleNumber).solutions;

    let tempSolutions = [];
    for (let solution of solutions) {
        tempSolutions.push(solution.board);
        let reversedBoard = structuredClone(solution.board);
        for (let i = 0; i < reversedBoard.length; i++) for (let j = 0; j < reversedBoard.length; j++) {
            if (reversedBoard[i][j] != -1) reversedBoard[i][j] = Number(!reversedBoard[i][j]);
        }
        tempSolutions.push(reversedBoard);
    }

    let answerNumber = generateBoard(answer.length, 0);
    for (let i = 0; i < answer.length; i++) for (let j = 0; j < answer.length; j++) {
        answerNumber[i][j] = getNumber(answer, {
            "x": i,
            "y": j
        }).counterMin;
    }
    console.log(tempSolutions);
    if (mode == "fairy") {
        while (tempSolutions.length > 1) {

            let sameToAnswer = generateBoard(answer.length, 0);
            for (let solution of tempSolutions) {
                for (let i = 0; i < solution.length; i++) for (let j = 0; j < solution.length; j++) {
                    if (ends[i][j] || answerNumber[i][j] == 0 || answerNumber[i][j] == 4) continue;
                    let number = getNumber(solution, {
                        "x": i,
                        "y": j
                    });
                    if (number.counterMin <= answerNumber[i][j] && answerNumber[i][j] <= number.counterMax) sameToAnswer[i][j]++;
                }
            }
            let hits = [];
            for (let i of sameToAnswer) for (let j of i) if (j > 0) hits.push(j);

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
                            if (!tempSolutions[solutionIndex]) break;
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
            console.log(tempSolutions);
        }
    } else {
        let sameToAnswer = generateBoard(answer.length, 0);
        while (tempSolutions.length > 1) {
            addGiven(tempSolutions, answer, sameToAnswer, given);
        }
    }
    console.log(tempSolutions);
    return {
        "given": given,
        "numbers": puzzleNumber
    };
}
function addGiven(tempSolutions, answer, sameToAnswer, given) {

    for (let solution of tempSolutions) {
        for (let i = 0; i < solution.length; i++) for (let j = 0; j < solution.length; j++) {
            if (solution[i][j] == -1 || solution[i][j] == answer[i][j]) sameToAnswer[i][j]++;
        }
    }
    minHits = Math.min(...sameToAnswer.flat(2));

    outerFor2: for (let i = 0; i < sameToAnswer.length; i++) {
        for (let j = 0; j < sameToAnswer.length; j++) {
            if (sameToAnswer[i][j] == minHits) {
                given[i][j] = answer[i][j];
                for (let solutionIndex = 0; solutionIndex < tempSolutions.length; solutionIndex++) {
                    if (!tempSolutions[solutionIndex]) break;
                    if (tempSolutions[solutionIndex][i][j] != -1 && tempSolutions[solutionIndex][i][j] != answer[i][j]) {
                        tempSolutions.splice(solutionIndex, 1);
                        solutionIndex--;
                    }
                }
                break outerFor2;
            }
        }
    }

}
function getNumber(board, coord) {
    let counterMin = 0, counterMax = 0;
    for (let dir of DIRECTIONS) {
        if (coord.x + dir.x < 0 || coord.x + dir.x >= board.length || coord.y + dir.y < 0 || coord.y + dir.y >= board.length) continue;
        else if (board[coord.x + dir.x][coord.y + dir.y] == 1) {
            counterMin++;
            counterMax++;
        } else if (board[coord.x + dir.x][coord.y + dir.y] == -1) {
            counterMax++;
        }
    }
    return {
        "counterMin": counterMin,
        "counterMax": counterMax
    };
}
function solve(ends, numbers) {
    let numberList = [];
    for (let i = 0; i < numbers.length; i++)for (let j = 0; j < numbers.length; j++) {
        if (numbers[i][j] != 0) numberList.push({
            "x": i,
            "y": j,
            "number": numbers[i][j]
        });
    }

    let endsList = [], branches = [], solutions = [];
    for (let i = 0; i < ends.length; i++) for (let j = 0; j < ends.length; j++) {
        if (ends[i][j]) endsList.push({
            "x": i,
            "y": j
        });
    }

    let endIndex2 = 0;
    outerFor: for (; ; endIndex2++) {
        for (let usedEnd of []) if (usedEnd.x == endsList[endIndex2].x && usedEnd.y == endsList[endIndex2].y) continue outerFor;
        break;
    }
    let endIndex1 = 0;
    outerFor3: for (; endIndex1 < endsList.length; endIndex1++) {
        if (endIndex1 == endIndex2) continue outerFor3;
        for (let usedEnd of []) if ((usedEnd.x == endsList[endIndex1].x && usedEnd.y == endsList[endIndex1].y)) continue outerFor3;

        let board = generateBoard(ends.length, -1);
        board[endsList[endIndex2].x][endsList[endIndex2].y] = 1;
        branches.push({
            "endIndex": endIndex1,
            "board": board,
            "branches": [],
            "pathCoords": [endsList[endIndex2]],
            "usedEnds": []
        });
        exploreFuturePaths(branches[branches.length - 1], ends, endsList[endIndex1], solutions);
    }

    outerFor2: for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
        if (!solutions[solutionIndex]) break;
        let regions = getRegions(solutions[solutionIndex].board);
        for (let end of endsList) {
            let region = getRegion(regions, end);
            if (solutions[solutionIndex].board[end.x][end.y] != -1 && (!region.isLine
                || (
                    !(region.ends[0].x == end.x && region.ends[0].y == end.y)
                    && !(region.ends[1].x == end.x && region.ends[1].y == end.y)
                ))) {
                solutions.splice(solutionIndex, 1);
                solutionIndex--;
                continue outerFor2;
            }
        }

        for (let number of numberList) {
            let counters = getNumber(solutions[solutionIndex].board, {
                "x": number.x,
                "y": number.y
            });
            if (counters.counterMin > number.number || counters.counterMax < number.number) {
                solutions.splice(solutionIndex, 1);
                solutionIndex--;
                continue outerFor2;
            }
        }

    }
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

function iterateSolution(tempSolutions, endsList, ends) {
    let solutions = [], branches = [];

    for (let tempSolution of tempSolutions) {
        let endIndex2 = 0;
        outerFor: for (; ; endIndex2++) {
            for (let usedEnd of tempSolution.usedEnds) if (usedEnd.x == endsList[endIndex2].x && usedEnd.y == endsList[endIndex2].y) continue outerFor;
            break;
        }
        let endIndex1 = 0;
        outerFor3: for (; endIndex1 < endsList.length; endIndex1++) {
            if (endIndex1 == endIndex2) continue outerFor3;
            for (let usedEnd of tempSolution.usedEnds) if ((usedEnd.x == endsList[endIndex1].x && usedEnd.y == endsList[endIndex1].y)) continue outerFor3;

            let board = tempSolution.board;
            let colorList = [];
            if (board[endsList[endIndex2].x][endsList[endIndex2].y] != -1) colorList = [board[endsList[endIndex2].x][endsList[endIndex2].y]];
            else colorList = [0, 1];
            for (let color of colorList) {
                let tempBoard = structuredClone(board);
                tempBoard[endsList[endIndex2].x][endsList[endIndex2].y] = color;
                branches.push({
                    "endIndex": endIndex1,
                    "board": tempBoard,
                    "branches": [],
                    "pathCoords": [endsList[endIndex2]]/*pathCoords*/,
                    "usedEnds": tempSolution.usedEnds
                });
                exploreFuturePaths(branches[branches.length - 1], ends, endsList[endIndex1], solutions);
            }
        }

    }

    for (let solutionIndex = 0; solutionIndex < solutions.length; solutionIndex++) {
        if (!solutions[solutionIndex]) break;
        let regions = getRegions(solutions[solutionIndex].board);
        for (let end of endsList) {
            let region = getRegion(regions, end);
            if (solutions[solutionIndex].board[end.x][end.y] != -1 && (!region.isLine
                || (
                    !(region.ends[0].x == end.x && region.ends[0].y == end.y)
                    && !(region.ends[1].x == end.x && region.ends[1].y == end.y)
                ))) {
                solutions.splice(solutionIndex, 1);
                solutionIndex--;
                break;
            }
        }
    }
    return solutions;
}

function exploreFuturePaths({
    "endIndex": endIndex,
    "board": board,
    "branches": branches,
    "pathCoords": pathCoords,
    "usedEnds": usedEnds
}, ends, finishCoord, solutions) {

    let coord = {
        "x": pathCoords[pathCoords.length - 1].x,
        "y": pathCoords[pathCoords.length - 1].y
    };
    let color = board[pathCoords[0].x][pathCoords[0].y];
    let dirAvailable = [];
    for (let j of DIRECTIONS) {
        if (coord.x + j.x < 0 || coord.x + j.x >= board.length || coord.y + j.y >= board.length || coord.y + j.y < 0) continue;
        if (checkGridAvailability(board, {
            "x": coord.x + j.x,
            "y": coord.y + j.y
        }, pathCoords, ends, finishCoord)) dirAvailable.push(j);
    }
    if (dirAvailable.length) {

        for (let dir of dirAvailable) {
            coord.x = pathCoords[pathCoords.length - 1].x + dir.x;
            coord.y = pathCoords[pathCoords.length - 1].y + dir.y;
            let tempPathCoords = structuredClone(pathCoords);
            tempPathCoords.push(structuredClone(coord));
            let tempBoard = structuredClone(board);
            tempBoard[coord.x][coord.y] = color;
            let lastCoord = tempPathCoords[tempPathCoords.length - 2];
            for (let j of DIRECTIONS) {
                if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= board.length || lastCoord.y + j.y >= board.length || lastCoord.y + j.y < 0) continue;
                if (tempBoard[lastCoord.x + j.x][lastCoord.y + j.y] != color) tempBoard[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
                checkOShape(tempBoard);
            }
            branches.push({
                "endIndex": endIndex,
                "board": tempBoard,
                "branches": [],
                "pathCoords": tempPathCoords,
                "usedEnds": usedEnds
            });
            if (!(coord.x == finishCoord.x && coord.y == finishCoord.y)) {
                exploreFuturePaths(branches[branches.length - 1], ends, finishCoord, solutions);
            } else {
                let lastCoord = tempPathCoords[tempPathCoords.length - 1];
                for (let j of DIRECTIONS) {
                    if (lastCoord.x + j.x < 0 || lastCoord.x + j.x >= board.length || lastCoord.y + j.y >= board.length || lastCoord.y + j.y < 0) continue;
                    if (tempBoard[lastCoord.x + j.x][lastCoord.y + j.y] != color) tempBoard[lastCoord.x + j.x][lastCoord.y + j.y] = Number(!color);
                }
                checkOShape(tempBoard);

                solutions.push({
                    "board": tempBoard,
                    "usedEnds": [...usedEnds, tempPathCoords[0], finishCoord]
                });
            }
        }
    }
}
for (let i of document.querySelectorAll("[data-for]")) {
    i.addEventListener("mousedown", function () {
        document.querySelector(".active").classList.remove("active");
        document.querySelector(`[data-id="${i.dataset.for}"]`).classList.add("active");
    });
}
let answerBoard = [], puzzle = [], userAnswer = [], lockedGrids = [];
function newGame(mode, size) {
    answerBoard = generateAnswer(size);
    puzzle = generatePuzzle(answerBoard.board, answerBoard.ends, mode);
    userAnswer = structuredClone(puzzle.given);
    lockedGrids = generateBoard(size, false);
    for (let i = 0; i < userAnswer.length; i++) for (let j = 0; j < userAnswer.length; j++) {
        if (userAnswer[i][j] == -1) userAnswer[i][j] = 0;
    }
    renderBoard(userAnswer, answerBoard.ends, puzzle.numbers, puzzle.given);
}
for (let i of document.querySelectorAll(".new-game")) {
    i.addEventListener("mousedown", function () {
        console.log(i);
        newGame(i.dataset.mode, Number(i.dataset.size));

        for (let childNode of document.getElementById("board").childNodes) {
            childNode.addEventListener("mousedown", function (e) {
                if (puzzle.given[Number(childNode.dataset.x)][Number(childNode.dataset.y)] != -1) return;
                downButton = e.button;
                if (e.button == 0) {
                    paint(childNode, true);
                } else if (e.button == 2) {
                    lockedGrids[Number(childNode.dataset.x)][Number(childNode.dataset.y)] = !lockedGrids[Number(childNode.dataset.x)][Number(childNode.dataset.y)];
                    if (lockedGrids[Number(childNode.dataset.x)][Number(childNode.dataset.y)]) childNode.classList.add("locked");
                    else childNode.classList.remove("locked");
                }
            });
            childNode.addEventListener("mouseenter", function () {
                if (puzzle.given[Number(childNode.dataset.x)][Number(childNode.dataset.y)] != -1) return;
                if (downButton == 0) {
                    paint(childNode, false);
                }
            });
            childNode.oncontextmenu = (e) => {
                e.preventDefault();
            };
        }
    });
}