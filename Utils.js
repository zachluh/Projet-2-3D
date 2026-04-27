function trouveCaseVide(matrice, number) {
    // chose a position if it is an empty space
    var corridors = [];
     for (var i = 1; i < matrice.length - 1; i++) {
         for (var j = 1; j < matrice[i].length - 1; j++) {
             if (matrice[i][j] === 0) corridors.push([i, j]);
         }
    }
     var chosenCorridor = Math.floor(Math.random() * corridors.length);
     matrice[corridors[chosenCorridor][0]][corridors[chosenCorridor][1]] = number;
     return corridors[chosenCorridor];
}