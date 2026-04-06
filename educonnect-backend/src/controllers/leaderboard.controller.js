const User = require("../models/User");
const Post = require("../models/Post");
const Event = require("../models/Event");
const Resource = require("../models/Resource");

exports.getLeaderboard = async (req, res) => {
  try {
    const { period = "global", category = "overall" } = req.query;

    const users = await User.find().select("uid name points avatar");

    const now = new Date();
    const startDate = new Date(0);

    if (period === "weekly") {
      startDate.setDate(now.getDate() - 7);
    }

    if (period === "monthly") {
      startDate.setMonth(now.getMonth() - 1);
    }

    const ranked = await Promise.all(
      users.map(async (user) => {
        const [postsCount, commentsCount, eventsJoined, resourcesUploaded] = await Promise.all([
          Post.countDocuments({ uid: user.uid, createdAt: { $gte: startDate } }),
          Post.countDocuments({ "comments.uid": user.uid, updatedAt: { $gte: startDate } }),
          Event.countDocuments({ participants: user.uid, updatedAt: { $gte: startDate } }),
          Resource.countDocuments({ uploadedBy: user.uid, createdAt: { $gte: startDate } }),
        ]);

        const computed =
          user.points +
          postsCount * 10 +
          commentsCount * 2 +
          eventsJoined * 8 +
          resourcesUploaded * 12;

        const categoryScore =
          category === "posts"
            ? postsCount * 10 + commentsCount * 2
            : category === "events"
              ? eventsJoined * 8
              : category === "resources"
                ? resourcesUploaded * 12
                : computed;

        return {
          uid: user.uid,
          name: user.name,
          avatar: user.avatar,
          points: user.points,
          score: categoryScore,
          metrics: {
            postsCount,
            commentsCount,
            eventsJoined,
            resourcesUploaded,
          },
        };
      })
    );

    const sorted = ranked.sort((a, b) => b.score - a.score).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPersonalRank = async (req, res) => {
  try {
    const { uid } = req.params;

    const users = await User.find().select("uid name points");
    const sorted = users.sort((a, b) => b.points - a.points);

    const index = sorted.findIndex((user) => user.uid === uid);
    if (index === -1) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      rank: index + 1,
      totalUsers: sorted.length,
      user: sorted[index],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};