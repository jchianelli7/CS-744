

def floydAlgorithm(DMatrix,PMatrix):
    for r in range(len(DMatrix)):
        for c in range(len(r)):
            for i in range(len(DMatrix)):
                if(DMatrix[r][c]>DMatrix[r][i]+DMatrix[i][c]):
                    DMatrix[r][c] = DMatrix[r][i] + DMatrix[i][c]
                    PMatrix[r][c] = i


def shortestPath(start,end,PMatrix):
    path=[]
    i=PMatrix[start][end]
    if(i!=start):
        path.append(start)
        path.append(end)
        return path
    else:
        path.append(shortestPath(start,i,PMatrix))
        path.append(shortestPath(i,end,PMatrix))