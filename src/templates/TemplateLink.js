export default function TemplateLink({ href, children }) {
  return (
    <>
      <a href={href} target='_blank' className='underline print:hidden'>
        {children}
      </a>
      <span className='hidden print:block'>{children}</span>
    </>
  )
}
