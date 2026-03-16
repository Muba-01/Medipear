import { Suspense } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
          {isOwnProfile ? <AccountConnections /> : null}
          <Suspense><PostList posts={posts} /></Suspense>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
