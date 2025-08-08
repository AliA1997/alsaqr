<div align="center">

  <img src="https://res.cloudinary.com/aa1997/image/upload/v1751518600/favicon_hiqtp9.svg" alt="logo" width="200" height="auto" />
  
# AlSaqr
  
  <p>
    AlSaqr Source Code
  </p>

  <p>
    Social Media for the MENA Region
  </p>

  <a href="https://alsaqr.netlify.app/">Live Site</a>

## Indexes
<pre>
  CREATE INDEX user_id_idx FOR (u:User) ON (u.id);
  CREATE INDEX comment_id_idx FOR (c: Comment) ON (c.id);
  CREATE INDEX post_id_idx FOR (p:Post) ON (p.id);
  CREATE INDEX list_id_idx FOR (l: List) ON (l.id);
  CREATE INDEX community_id_idx FOR (c:Community) ON (c.id);
  CREATE INDEX community_discussion_id_idx FOR (cd: CommunityDiscussion) ON (cd.id);
</pre>



</div>