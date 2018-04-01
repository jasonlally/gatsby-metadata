import React from 'react'
import Link from 'gatsby-link'

const IndexPage = ({ data }) => (
  <ol>
    {data.allMarkdownRemark.edges.map(({ node }) =>
    <li>
      <Link to={node.fields.slug}>{node.frontmatter.dataset_name}</Link>
    </li>
  )}
  </ol>
)

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: { fields: [frontmatter___dataset_name], order: ASC }) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            dataset_name
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }`

export default IndexPage
