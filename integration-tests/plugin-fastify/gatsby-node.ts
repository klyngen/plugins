import path from "path";
import type { GatsbyNode } from "gatsby";

export const createPages: GatsbyNode["createPages"] = async (gatsbyUtilities) => {
  const {
    actions: { createRedirect, createPage },
    graphql,
  } = gatsbyUtilities;

  const result = await graphql(`
    query fakerQuery {
      allNameData {
        nodes {
          lorem {
            paragraphs
            slug
            words
          }
          name {
            lastName
            firstName
          }
        }
      }
    }
  `);

  const fakerPostTemplate = path.resolve(`src/templates/fakerPost.js`);
  const fakerPostArchive = path.resolve(`src/templates/fakerArchive.js`);

  createPage({
    path: `/faker/`,
    component: fakerPostArchive,
    defer: true,
    context: {
      //@ts-ignore
      posts: result.data.allNameData.nodes,
    },
  });
  //@ts-ignore
  result.data.allNameData.nodes.forEach((node) => {
    createPage({
      path: `/faker/${node.lorem.slug}`,
      component: fakerPostTemplate,
      defer: true,
      context: {
        slug: node.lorem.slug,
      },
    });
  });

  for (let i = 1; i <= 10; i++) {
    createPage({
      path: `/generated/page-${i}`,
      component: path.resolve(`./src/templates/example.js`),
      defer: i <= 5 ? false : true,
      context: {
        pageNumber: i,
      },
    });
  }

  createRedirect({
    fromPath: "/perm-redirect",
    toPath: "/posts/page-1",
    isPermanent: true,
  });
  createRedirect({
    fromPath: "/temp-redirect",
    toPath: "/posts/page-2",
    isPermanent: false,
  });
  createRedirect({
    fromPath: "/alt-redirect",
    toPath: "/posts/page-3",
    statusCode: 307,
  });

  createRedirect({
    fromPath: "/example-proxy",
    toPath: "http://example.com",
    statusCode: 200,
  });

  createRedirect({
    fromPath: "/example-proxy-star/*",
    toPath: "http://example.com/*",
    statusCode: 200,
  });
};

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({
  actions,
  schema,
}) => {
  actions.createTypes(
    schema.buildObjectType({
      name: `TestImage`,
      fields: {
        title: "String",
      },
      interfaces: [`Node`, `RemoteFile`],
    })
  );
};

export const sourceNodes: GatsbyNode["sourceNodes"] = async ({ actions }) => {
  actions.createNode({
    id: `test-image`,
    url: "https://images.unsplash.com/photo-1650247452475-b5866374545d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb",
    mimeType: "image/jpeg",
    title: "test image",
    filename: "indonesia.jpg",
    width: 2666,
    height: 3996,
    internal: {
      type: `TestImage`,
      contentDigest: `test-image`,
    },
  });
};
