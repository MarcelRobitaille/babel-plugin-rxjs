const source = getMessages()
  .mergeMap(getEach) 
  .map(test)
  .mergeAll()

source.first()

