export const renderColoredText = (text: string) => {
  const lines = text.split('\n')

  return lines.map((line, lineIndex) => {
    const words = line.split(/(\s+)/)
    let wordIndex = 0

    const lineContent = words.map((word, wordIndexInLine) => {
      if (word.trim()) {
        const isAccent = wordIndex % 3 === 2
        wordIndex++
        return (
          <span key={wordIndexInLine} className={isAccent ? 'text-accent' : ''}>
            {word}
            {word.endsWith('.') && <br />}
          </span>
        )
      } else {
        return <span key={wordIndexInLine}>{word}</span>
      }
    })

    return (
      <span key={lineIndex}>
        {lineContent}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    )
  })
}
