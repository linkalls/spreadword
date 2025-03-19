interface BlogPost {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  body: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "first-post",
    title: "テストブログ1",
    date: "2025-03-14",
    description: "これはテストブログ1です。",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam augue sem, sollicitudin vitae dapibus in, tincidunt quis ligula. Quisque et est euismod orci vestibulum iaculis sed et erat. Quisque varius odio sed sapien dictum, vitae sodales lacus tempus. Sed non lobortis ante. Morbi bibendum tortor vitae malesuada lobortis. Vivamus interdum scelerisque faucibus. Etiam justo sapien, iaculis in convallis eu, commodo at massa. Etiam interdum aliquam lacus, eget lobortis sapien condimentum vitae. Vivamus sagittis faucibus ipsum in vestibulum. Aenean tincidunt dapibus sapien nec blandit.

Nam vel neque elementum, pellentesque sapien eget, lobortis justo. Duis non leo tellus. Curabitur sit amet dictum libero. Nunc iaculis, purus cursus vehicula sodales, dui metus malesuada sapien, laoreet hendrerit arcu nulla at ex. Etiam eu condimentum sapien, sit amet sollicitudin leo. Sed finibus venenatis nisi et faucibus. Quisque iaculis eu sapien id tempor. Sed viverra, justo eget maximus consequat, dolor diam vulputate enim, a dapibus quam libero ac felis. In nec facilisis nisi. Fusce ultricies gravida ligula vel tincidunt. Quisque egestas tristique nibh, non posuere ligula ultricies a. Integer neque metus, sodales nec sem ac, finibus mattis quam. Curabitur augue elit, accumsan vehicula odio in, pharetra suscipit est. Vivamus eget iaculis sapien.

In porttitor molestie lorem, in porttitor elit vestibulum eu. Quisque fermentum lectus sed scelerisque malesuada. Donec nec odio in dui dictum efficitur vitae a risus. Integer id bibendum ex, id lobortis sem. Aenean sed metus sem. Proin ut diam vitae nisl volutpat rutrum vitae ut mauris. Pellentesque imperdiet commodo lectus vel auctor. Integer nec accumsan odio. Mauris ac massa finibus, condimentum enim non, sodales urna. Ut consequat augue eu ante scelerisque eleifend. Ut eu nibh sed felis dapibus aliquet. Integer sagittis lacinia lectus nec fermentum.

Vivamus blandit tellus nec tellus tincidunt, ac sollicitudin turpis porta. Sed bibendum lorem eu ipsum blandit, vitae mollis mi bibendum. Donec accumsan interdum mollis. Vivamus quis velit in purus fringilla congue. Nullam dignissim auctor justo sit amet lacinia. Curabitur a orci vitae turpis tristique aliquet in vel lectus. Donec semper lectus quis velit hendrerit dignissim. Nunc gravida libero et est dapibus, ac tempor ipsum porttitor. Etiam non luctus arcu, id consequat nisi. Aenean rutrum est ut leo semper, ut sodales felis vehicula.

Phasellus ut purus hendrerit, rhoncus nibh et, vestibulum felis. Nam consectetur volutpat gravida. Donec justo nulla, pulvinar vel euismod sit amet, dapibus at elit. Nunc enim nulla, vehicula non nisl id, lobortis tincidunt dolor. Sed pellentesque massa id sem suscipit, sit amet molestie dui efficitur. Proin euismod, risus et tincidunt consectetur, purus neque porttitor neque, in finibus augue massa in justo. Cras ullamcorper imperdiet ligula ut mollis. Praesent mollis, ex vel tincidunt ullamcorper, mauris augue pulvinar nisi, ac commodo orci purus ac orci. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.`,
    tags: ["React", "TypeScript"],
  },
  {
    id: "second-post",
    title: "テストブログ2",
    date: "2025-03-14",
    description: "これはテストブログ2です。",
    tags: ["React", "TypeScript"],
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam augue sem, sollicitudin vitae dapibus in, tincidunt quis ligula. Quisque et est euismod orci vestibulum iaculis sed et erat. Quisque varius odio sed sapien dictum, vitae sodales lacus tempus. Sed non lobortis ante. Morbi bib
    endum tortor vitae malesuada lobortis. Vivamus interdum scelerisque faucibus. Etiam justo sapien, iaculis in convallis eu, commodo at massa. Etiam interdum aliquam lacus, eget lobortis sapien condimentum vitae. Vivamus sagittis faucibus ipsum in vestibulum. Aenean tincidunt dapibus sapien nec blandit.  Nam vel neque elementum, pellentesque sapien eget, lobortis justo. Duis non leo tellus. Curabitur sit amet dictum libero. Nunc iaculis, purus cursus vehicula sod
    `,
  },
  {
    id: "third-post",
    title: "テストブログ3",
    date: "2025-03-14",
    description: "これはテストブログ3です。",
    tags: ["React", "TypeScript"],
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam augue sem, sollicitudin vitae dapibus in, tincidunt quis ligula. Quisque et est euismod orci vestibulum iaculis sed et erat. Quisque varius odio sed sapien dictum, vitae sodales lacus tempus. Sed non lobortis ante. Morbi bib            `,
  },
];
