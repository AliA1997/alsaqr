import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { CommentToDisplay } from 'typings';

type CommentPdfProps = {
    commentToDisplay: CommentToDisplay;
    userId: string;
    showLabel?: boolean;
    createdAt: string;
}

// Create styles - reusing many from PostPDF but adjusted for comments
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'column',
    borderBottom: '1px solid #f3f4f6',
    padding: 20,
    paddingLeft: 60, // More indentation for comments
  },
  tagLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 10,
    backgroundImage: 'linear-gradient(to right, #fee2e2, #f3e8ff, #fce7f3)',
    // Fallback solid color if gradients aren't supported
    backgroundColor: '#f3e8ff', // purple-100 as fallback
    color: '#6b21a8',
    padding: '2px 6px',
    borderRadius: 4,
  },
  contentContainer: {
    position: 'relative',
    flexDirection: 'row',
    gap: 12,
  },
  profileImage: {
    height: 32, // Slightly smaller for comments
    width: 32,
    borderRadius: 16,
  },
  username: {
    fontWeight: 'bold',
    marginRight: 4,
    fontSize: 11, // Slightly smaller text
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  handle: {
    fontSize: 10,
    color: '#6b7280',
  },
  timestamp: {
    fontSize: 10,
    color: '#6b7280',
  },
  commentText: {
    fontSize: 12, // Slightly smaller than post text
    paddingTop: 4,
    lineHeight: 1.4,
    width: '90%'
  },
  commentImage: {
    width: 250, // Smaller than post images
    height: 150,
    margin: 10,
    marginLeft: 0,
  },
});

const CommentPDF = ({ 
  commentToDisplay, 
  userId, 
  showLabel = true, 
  createdAt 
}: CommentPdfProps) => {
  return (
    <Document>
      <Page size="A4" style={{ padding: 40 }}>
        <View style={styles.container}>
          {showLabel && (
            <View style={styles.tagLabel}>
              <Text>Comment</Text>
            </View>
          )}
          
          <View style={styles.contentContainer}>
            <Image
              style={styles.profileImage}
              src={commentToDisplay.profileImg}
            />
            
            <View>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{commentToDisplay.username}</Text>
                {userId === commentToDisplay.username && (
                  <Text style={{ color: '#00ADED', fontSize: 10 }}>✓</Text>
                )}
                <Text style={styles.handle}>
                  @{commentToDisplay.username.replace(/\s+/g, "")}
                </Text>
                <Text style={styles.timestamp}>
                  {createdAt}
                </Text>
              </View>
              
              <Text style={styles.commentText}>{commentToDisplay.text}</Text>
              
              {commentToDisplay.image && (
                <Image
                  style={styles.commentImage}
                  src={commentToDisplay.image}
                />
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CommentPDF;