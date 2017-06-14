
exports.seed = function(knex, Promise) {
  return knex('projects')
  .del()
    .then(function () {
      return knex('projects').insert([{
        project_owner: 1,
        project_title: 'Cowbell Plus',
        project_description: 'A project exploring just HOW MUCH cowbell you can actually put into a single song.'
      },
      {
        project_owner: 1,
        project_title: 'What is a Popsicle?',
        project_description: 'A song to listen to while you contemplate some of life\'s deeper questions...'
      }, {
        project_owner: 2,
        project_title: 'AtomBomb',
        project_description: 'The name says it all...'
      }]);

    }).then(function(){
      return knex.raw("SELECT setval('projects_id_seq', (SELECT MAX(id) FROM users));");
    });
};
