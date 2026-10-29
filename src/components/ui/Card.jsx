export default function Card({ children, className = '', tone = 'default', as: Tag = 'section', ...props }) {
  const classes = ['card', tone !== 'default' ? `card--${tone}` : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  )
}
