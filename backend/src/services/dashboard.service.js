import Article from '../models/article.model.js';
import ArticleViewStat from '../models/article-view-stat.model.js';
import Category from '../models/category.model.js';
import Comment from '../models/comment.model.js';
import Tag from '../models/tag.model.js';

function getLast7Days() {
  const days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;

    days.push({
      key,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      date
    });
  }

  return days;
}

function buildTrendRows(days, groupedRows = []) {
  const map = new Map();
  groupedRows.forEach((item) => {
    map.set(item._id, {
      total: Number(item.total || 0),
      published: Number(item.published || 0),
      draft: Number(item.draft || 0)
    });
  });

  return days.map((day) => {
    const target = map.get(day.key) || { total: 0, published: 0, draft: 0 };
    return {
      date: day.key,
      label: day.label,
      total: target.total,
      published: target.published,
      draft: target.draft
    };
  });
}

function buildViewTrend(days, rows = []) {
  const map = {};
  days.forEach((d) => {
    map[d.key] = 0;
  });

  rows.forEach((row) => {
    if (map[row.date] !== undefined) {
      map[row.date] = Number(row.views || 0);
    }
  });

  return days.map((d) => ({
    date: d.key,
    label: d.label,
    views: map[d.key] || 0
  }));
}

function toHotArticleDTO(item) {
  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    viewCount: Number(item.viewCount || 0),
    status: item.status,
    createdAt: item.createdAt,
    publishedAt: item.publishedAt
  };
}

export async function getDashboardOverview() {
  const days = getLast7Days();
  const startDate = days[0].date;
  const startDateKey = days[0].key;

  const [
    articleTotal,
    publishedTotal,
    draftTotal,
    categoryTotal,
    tagTotal,
    pendingTotal,
    approvedTotal,
    rejectedTotal,
    trendRows,
    hotArticles,
    totalViewRows
  ] = await Promise.all([
    Article.countDocuments({}),
    Article.countDocuments({ status: 'published' }),
    Article.countDocuments({ status: 'draft' }),
    Category.countDocuments({}),
    Tag.countDocuments({}),
    Comment.countDocuments({ status: 'pending' }),
    Comment.countDocuments({ status: 'approved' }),
    Comment.countDocuments({ status: 'rejected' }),
    Article.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          total: { $sum: 1 },
          published: {
            $sum: {
              $cond: [{ $eq: ['$status', 'published'] }, 1, 0]
            }
          },
          draft: {
            $sum: {
              $cond: [{ $eq: ['$status', 'draft'] }, 1, 0]
            }
          }
        }
      }
    ]),
    Article.find({ status: 'published' })
      .sort({ viewCount: -1, publishedAt: -1, createdAt: -1 })
      .limit(10)
      .select('title slug viewCount status createdAt publishedAt'),
    ArticleViewStat.aggregate([
      {
        $lookup: {
          from: 'articles',
          localField: 'article',
          foreignField: '_id',
          as: 'articleDoc'
        }
      },
      { $unwind: '$articleDoc' },
      { $match: { date: { $gte: startDateKey }, 'articleDoc.status': 'published' } },
      {
        $group: {
          _id: '$date',
          views: { $sum: '$views' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  let trendByArticle = {};

  if (hotArticles.length > 0) {
    const hotArticleIds = hotArticles.map((item) => item._id);
    const hotTrendRows = await ArticleViewStat.find({
      article: { $in: hotArticleIds },
      date: { $gte: startDateKey }
    })
      .select('article date views')
      .sort({ date: 1 })
      .lean();

    trendByArticle = hotTrendRows.reduce((acc, item) => {
      const key = item.article.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push({ date: item.date, views: item.views });
      return acc;
    }, {});
  }

  return {
    stats: {
      articleTotal,
      publishedTotal,
      draftTotal,
      categoryTotal,
      tagTotal,
      commentPending: pendingTotal,
      commentApproved: approvedTotal,
      commentRejected: rejectedTotal
    },
    articleTrend7d: buildTrendRows(days, trendRows),
    commentStatus: [
      { status: 'pending', label: '\u5f85\u5ba1\u6838', count: pendingTotal },
      { status: 'approved', label: '\u5df2\u901a\u8fc7', count: approvedTotal },
      { status: 'rejected', label: '\u5df2\u62d2\u7edd', count: rejectedTotal }
    ],
    hotArticles: hotArticles.map((item) => {
      const id = item._id.toString();
      return {
        ...toHotArticleDTO(item),
        trend7d: buildViewTrend(days, trendByArticle[id] || [])
      };
    }),
    totalViewTrend7d: hotArticles.length
      ? buildViewTrend(
          days,
          totalViewRows.map((row) => ({ date: row._id, views: row.views }))
        )
      : buildViewTrend(days, [])
  };
}
