"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Post } from "@/services/infrastructure/wordpress/types/post";
import PostCards from "@/components/cards/post-cards";

type Props = {
  posts: Post[];
  numberOfPosts?: number;
  numberOfPostsPerRow?: number;
};

function PostsSection({
  posts,
  numberOfPosts = 4,
  numberOfPostsPerRow = 4,
}: Props) {
  const renderSkeleton = () => (
    <div className={`grid grid-cols-12 gap-6`}>
      {[...Array(numberOfPostsPerRow)].map((_, idx) => (
        <Skeleton
          key={idx}
          className="col-span-12 flex h-[326px] flex-col overflow-hidden rounded-lg bg-neutral-200 drop-shadow-md md:col-span-4 lg:col-span-3"
        >
          <Skeleton className="aspect-[16/9] h-[220px] w-full !rounded-none object-cover" />
        </Skeleton>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {!posts ? (
        renderSkeleton()
      ) : (
        <div className={`grid grid-cols-12 gap-3`}>
          {posts.slice(0, numberOfPosts).map((item, idx) => {
            return (
              <PostCards
                post={item}
                key={idx}
                numberItemPerRow={numberOfPostsPerRow}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PostsSection;
