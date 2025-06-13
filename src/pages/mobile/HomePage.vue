<template>
  <q-page class="mobile-home-page" :class="{ 'dark-bg': $q.dark.isActive }">
    <!-- Header with safe area -->
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          <q-icon name="screen_record" color="primary" class="q-mr-sm" />
          Scouter
        </q-toolbar-title>
        
        <q-chip 
          :color="isCapacitor ? 'green' : 'orange'" 
          text-color="white" 
          size="sm"
          :icon="isCapacitor ? 'smartphone' : 'web'"
        >
          {{ platformName }}
        </q-chip>
      </q-toolbar>
    </q-header>

    <!-- Reddit-style Feed -->
    <div class="feed-container q-pa-none">
      <!-- Welcome Card -->
      <q-card class="welcome-card home-card q-ma-md" flat>
        <q-card-section class="text-center">
          <q-avatar size="80px" color="primary" text-color="white" icon="video_camera_front" />
          <div class="text-h6 q-mt-md">Welcome to Scouter</div>
          <div class="text-body2 text-grey-6">
            Record your screen on desktop, view videos on mobile
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn 
            unelevated 
            color="primary" 
            label="View Videos" 
            icon="video_library"
            @click="$router.push('/mobile/videos')"
          />
        </q-card-actions>
      </q-card>

      <!-- Posts/Cards Feed -->
      <div v-for="post in posts" :key="post.id" class="post-card">
        <q-card flat class="home-card q-mx-md q-mb-sm">
          <!-- Post Header -->
          <q-card-section class="row items-center q-pb-none">
            <q-avatar size="32px" :color="post.avatarColor" text-color="white">
              <q-icon :name="post.avatar" />
            </q-avatar>
            <div class="q-ml-sm">
              <div class="text-weight-medium">{{ post.author }}</div>
              <div class="text-caption text-grey-6">{{ formatTimeAgo(post.createdAt) }}</div>
            </div>
            <q-space />
            <q-btn flat round size="sm" icon="more_vert" />
          </q-card-section>

          <!-- Post Content -->
          <q-card-section>
            <div class="text-body1">{{ post.title }}</div>
            <div v-if="post.content" class="text-body2 text-grey-7 q-mt-sm">
              {{ post.content }}
            </div>
          </q-card-section>

          <!-- Post Media (if any) -->
          <q-card-section v-if="post.image" class="q-pt-none">
            <q-img :src="post.image" class="rounded-borders" ratio="16/9" />
          </q-card-section>

          <!-- Post Actions (Reddit-style) -->
          <q-card-actions class="row items-center justify-between">
            <div class="row items-center">
              <!-- Upvote/Downvote -->
              <q-btn-group flat>
                <q-btn 
                  flat 
                  size="sm" 
                  icon="keyboard_arrow_up" 
                  :color="post.userVote === 'up' ? 'orange' : 'grey-6'"
                  @click="vote(post, 'up')"
                />
                <div class="vote-count q-px-xs text-weight-medium" 
                     :class="post.userVote === 'up' ? 'text-orange' : post.userVote === 'down' ? 'text-blue' : 'text-grey-6'">
                  {{ formatVotes(post.votes) }}
                </div>
                <q-btn 
                  flat 
                  size="sm" 
                  icon="keyboard_arrow_down" 
                  :color="post.userVote === 'down' ? 'blue' : 'grey-6'"
                  @click="vote(post, 'down')"
                />
              </q-btn-group>

              <!-- Comments -->
              <q-btn 
                flat 
                size="sm" 
                icon="comment" 
                :label="post.comments.toString()"
                color="grey-6"
                class="q-ml-md"
              />
            </div>

            <!-- Share -->
            <q-btn 
              flat 
              size="sm" 
              icon="share" 
              color="grey-6"
              @click="sharePost(post)"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Load More -->
      <div class="text-center q-pa-md">
        <q-btn 
          outline 
          color="primary" 
          label="Load More Posts" 
          icon="refresh"
          @click="loadMorePosts"
          :loading="loadingMore"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { usePlatform } from 'src/composables/usePlatform';

interface Post {
  id: string;
  author: string;
  avatar: string;
  avatarColor: string;
  title: string;
  content?: string;
  image?: string;
  votes: number;
  comments: number;
  createdAt: Date;
  userVote?: 'up' | 'down' | null;
}

const $q = useQuasar();
const { isCapacitor, platformName } = usePlatform();

const posts = ref<Post[]>([]);
const loadingMore = ref(false);

// Mock Reddit-style posts
const mockPosts: Post[] = [
  {
    id: '1',
    author: 'u/screen_recorder',
    avatar: 'person',
    avatarColor: 'blue',
    title: 'Just recorded my first 10-minute tutorial using Scouter!',
    content: 'The quality is amazing and the interface is so clean. Love how I can view it instantly on my phone.',
    votes: 156,
    comments: 23,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    userVote: null
  },
  {
    id: '2',
    author: 'u/mobile_user',
    avatar: 'smartphone',
    avatarColor: 'green',
    title: 'The mobile video viewer is incredible',
    content: 'Being able to watch my desktop recordings on my phone with native sharing is a game changer.',
    votes: 89,
    comments: 12,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    userVote: null
  },
  {
    id: '3',
    author: 'u/dev_tips',
    avatar: 'code',
    avatarColor: 'purple',
    title: 'Pro tip: Use Scouter for code reviews',
    content: 'Record your screen while explaining code changes. Much better than written comments!',
    votes: 234,
    comments: 45,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    userVote: null
  },
  {
    id: '4',
    author: 'u/content_creator',
    avatar: 'movie',
    avatarColor: 'red',
    title: 'Cross-platform recording made easy',
    content: 'Desktop recording + mobile viewing = perfect workflow for content creators',
    votes: 67,
    comments: 8,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    userVote: null
  }
];

const loadMorePosts = () => {
  loadingMore.value = true;
  // Simulate loading
  setTimeout(() => {
    posts.value.push(...mockPosts.slice(0, 2)); // Add some more posts
    loadingMore.value = false;
  }, 1000);
};

const vote = (post: Post, direction: 'up' | 'down') => {
  if (post.userVote === direction) {
    // Remove vote
    post.votes += direction === 'up' ? -1 : 1;
    post.userVote = null;
  } else {
    // Change or add vote
    if (post.userVote) {
      // Change from opposite vote
      post.votes += direction === 'up' ? 2 : -2;
    } else {
      // New vote
      post.votes += direction === 'up' ? 1 : -1;
    }
    post.userVote = direction;
  }
};

const sharePost = (post: Post) => {
  $q.notify({
    type: 'info',
    message: `Shared: ${post.title}`,
    position: 'top'
  });
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
};

const formatVotes = (votes: number): string => {
  if (votes >= 1000) {
    return `${(votes / 1000).toFixed(1)}k`;
  }
  return votes.toString();
};

onMounted(() => {
  posts.value = [...mockPosts];
});
</script>

<style scoped>
.mobile-home-page {
  background: #f5f5f5;
}

.mobile-home-page.dark-bg {
  background: #121212;
}

.feed-container {
  padding-top: 8px;
  padding-bottom: 80px; /* Account for bottom tabs */
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-card .text-h6,
.welcome-card .text-body2 {
  color: white;
}

.home-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
  border-left: 3px solid transparent;
  transition: border-color 0.3s ease;
}

.home-card:hover {
  border-left-color: var(--q-primary);
}

body.body--dark .home-card {
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: #1e1e1e;
}

.post-card {
  background: transparent;
}

.vote-count {
  font-size: 12px;
  min-width: 30px;
  text-align: center;
}
</style> 