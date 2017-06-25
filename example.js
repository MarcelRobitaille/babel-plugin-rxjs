// @type {Observable}
// const source = getMessages()
  // .mergeMap(getEach) 
  // .mergeAll()

// source.first()

// Observable.of()
  // .map()

export const init = () => {
  notifier.notify('Getting messages...')

  // @type {Observable}
  const source = getMessages({
    maxResults: 10,
    userId: 'me',
    q: 'from:noreply@youtube.com',
  })
    .mergeMap(getEach) // Get more info about each message
    .mergeAll() // Flatten
    .filter(filter)
    .map(buildMessage) // Decode body

  // Notify when first done
  source.first().subscribe(() => notifier.notify('Getting links...'))

  // Return source + links
  return source.mergeMap(getLinks)
}


