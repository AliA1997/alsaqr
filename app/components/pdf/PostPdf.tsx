import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { convertDateToDisplay, formatTimeAgo } from '@utils/neo4j/neo4j';
import { PostToDisplay } from 'typings';

type PdfProps = {
    postToDisplay: PostToDisplay;
    userId: string; 
    showLabel: boolean;
    createdAt: string;
}

// Create styles
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'column',
    borderTop: '1px solid #f3f4f6',
    borderBottom: '1px solid #f3f4f6',
    padding: 20,
  },
  tagLabel: {
    position: 'absolute',
    backgroundImage: 'linear-gradient(to right, #e0e7ff, #f3e8ff, #fce7f3)',
    // Fallback solid color if gradients aren't supported
    backgroundColor: '#f3e8ff', // purple-100 as fallback
    color: '#3730a3', // corresponds to text-indigo-800
    top: 0,
    right: 0,
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 4,
  },
  contentContainer: {
    position: 'relative',
    flexDirection: 'row',
    gap: 12,
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  username: {
    fontWeight: 'bold',
    marginRight: 4,
    fontSize: 12, // Slightly smaller text
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
  },
  handle: {
    fontSize: 11,
    color: '#6b7280',
  },
  timestamp: {
    fontSize: 11,
    color: '#6b7280',
  },
  postText: {
    fontSize: 12,
    paddingTop: 4,
    width: '90%'
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 20,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: 10,
  },
  postImage: {
    width: 300,
    height: 200,
    margin: 20,
    marginLeft: 0,
  },
  actionsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const PostPDF = ({ postToDisplay,  userId, showLabel = true, createdAt }: PdfProps) => {
    const postInfo = postToDisplay.post;
    return (
  <Document>
    <Page size="A4" style={{ padding: 40 }}>
      <View style={styles.container}>
        {showLabel && (
          <View style={styles.tagLabel}>
            <Text>Post</Text>
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <Image
            style={styles.profileImage}
            src={postToDisplay.profileImg}
          />
          
          <View>
            <View style={styles.userInfo}>
              <Text style={styles.username}>{postToDisplay.username}</Text>
              {userId === postToDisplay.username && (
                <Text>✓</Text>
              )}
              <Text style={styles.handle}>
                @{postToDisplay.username ? postToDisplay.username.replace(/\s+/g, "") : ""}.
              </Text>
              <Text style={styles.timestamp}>
                {createdAt}
              </Text>
            </View>
            
            <Text style={styles.postText}>{postInfo.text}</Text>
            
            {postInfo.tags?.length > 0 && (
              <View style={styles.tagsContainer}>
                {postInfo.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            )}
            
            {postInfo.image && (
              <Image
                style={styles.postImage}
                src={postInfo.image}
              />
            )}
          </View>
        </View>
      </View>
    </Page>
  </Document>
    );
}

export default PostPDF;
