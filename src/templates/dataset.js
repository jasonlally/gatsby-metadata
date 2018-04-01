import React from 'react'
import Linkify from 'react-linkify'

const alphaSort = (a,b) => {
  if(a.field_name.toLowerCase() < b.field_name.toLowerCase()) return -1
  if(a.field_name.toLowerCase() > b.field_name.toLowerCase()) return 1
  return 0
}

export default ({data}) => {
  const post = data.markdownRemark
  const fields = post.frontmatter.fields.sort(alphaSort)
  const desc = post.frontmatter.description ? post.frontmatter.description.split(/(\r\n|\n|\r)/g) : null
  const attachments = post.frontmatter.attachments
  return (
    <div className="usa-content">
      <h1>{post.frontmatter.dataset_name}</h1>
      {desc ? desc.map((para, idx) => {
        if(para.length > 5 && idx === 0) return <Linkify><p className="usa-font-lead" key={idx}>{para}</p></Linkify>
        if(para.length > 5 ) return <Linkify><p key={idx}>{para}</p></Linkify>
      }): null}
      <hr />
      <p>Publishing Department: {post.frontmatter.department}</p>
      <p>Dataset Link: <a href={post.frontmatter.url}>{post.frontmatter.url}</a></p>
      {attachments ?
        attachments.map((att) => {
        return (
          <li><a href={att.url}>{att.name}</a></li>
        )
      }) : null }
      <table>
        <thead>
          <tr>
            <th scope="col">Field Name (opt. alias)</th>
            <th scope="col">Field Definition</th>
            <th scope="col">API Key</th>
          </tr>
        </thead>
        <tbody>
        {fields.map((field) => {
          let alias = (field.field_alias && field.field_alias !== field.field_name) ? ' (' + field.field_alias + ')' : ''
          return (<tr>
            <th scope="row">{field.field_name + alias}</th>
            <td><Linkify>{field.field_definition}</Linkify></td>
            <td>{field.api_key}</td>
          </tr>)
        })
      }
      </tbody>
    </table>
  </div>
  )
}

export const query = graphql`
  query DatasetQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        dataset_name,
        department,
        url,
        description,
        keywords,
        fields {
          field_name,
          field_alias,
          field_type,
          api_key,
          field_definition
        },
        attachments {
          name,
          url
        }
      }
    }
  }
`