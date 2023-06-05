const path = require('path');
const FolderManager = require(path.resolve('./config/publicutils/folderManager.utils'));
const middlewares = require(path.resolve('./config/publicutils/middlewares'));
const rateLimiterUtil = require(path.resolve('./config/lib/limiter-util'));
const langResources = require(path.resolve('./config/langResources'));

module.exports = (app, limiter) => {
  // All methods must under /dashboard must pass through middleware
  const routeMiddlewares = [
    middlewares.checkOrganization,
    middlewares.checkAuthentication,
    middlewares.checkActive,
    middlewares.checkInactivity,
  ];

  if (rateLimiterUtil.useRateLimiter()) {
    routeMiddlewares.push(limiter(middlewares.rateLimitAuthenticated));
  }

  app.use('/folder', routeMiddlewares);

  // Route to fetch all folders for the clientstore
  app.get('/folder', async (req, res) => {
    try {
      const response = await FolderManager.getAllFolders(req);
      res.send(response);
    } catch (error) {
      res.status(422).send({ error: error.userMessage });
    }
  });

  // Route to create new folder
  app.post('/folder', async (req, res) => {
    const { name } = req.body;
    if (!name) {
      res.status(422).send({ error: langResources.getResourceString('missingFolderName') });
      return;
    }

    try {
      const folderDetails = await FolderManager.createNewFolder(req, name);
      if (folderDetails) {
        res.send(folderDetails);
      } else {
        res.status(422).send({ error: 'Unkown error creating folder' });
      }
    } catch (error) {
      console.log(error);
      res.status(422).send({ error: error.userMessage });
    }
  });

  // Route to fetch details of a folder
  app.get('/folder/:folder_id', async (req, res) => {
    const folder_id = Number(req.params.folder_id);

    if (Number.isNaN(folder_id)) {
      res.status(422).send({ error: langResources.getResourceString('missingFolderId') });
      return;
    }

    try {
      const response = await FolderManager.getFolderDetails(req, folder_id);
      res.send(response);
    } catch (error) {
      res.status(422).send({ error: error.userMessage });
    }
  });

  // Route to add lists to a folder
  app.post('/folder/:folder_id/add_lists', async (req, res) => {
    const folder_id = Number(req.params.folder_id);
    const { list_ids } = req.body;

    if (!list_ids || !Array.isArray(list_ids) || list_ids.length === 0) {
      res.status(422).send({ error: langResources.getResourceString('missingListIds') });
      return;
    }
    if (Number.isNaN(folder_id)) {
      res.status(422).send({ error: langResources.getResourceString('missingFolderId') });
      return;
    }

    try {
      const folderDetails = await FolderManager.addListToFolder(req, folder_id, list_ids);
      res.send(folderDetails);
    } catch (error) {
      res.status(422).send({ error: error.userMessage });
    }
  });

  // Route to remove lists from a folder
  app.post('/folder/:folder_id/remove_lists', async (req, res) => {
    const folder_id = Number(req.params.folder_id);
    const { list_ids } = req.body;
    let results;

    if (!list_ids || !Array.isArray(list_ids) || list_ids.length === 0) {
      res.status(422).send({ error: langResources.getResourceString('missingListIds') });
      return;
    }
    if (Number.isNaN(folder_id)) {
      res.status(422).send({ error: langResources.getResourceString('missingFolderId') });
      return;
    }

    try {
      if (list_ids.length > 0) {
        results = await FolderManager.removeListFromFolder(req, folder_id, list_ids);
      }
      if (results[0].affected_rows > 0) {
        res.send(await FolderManager.getFolderDetails(req, folder_id));
      } else {
        res.status(422).send({
          error: `Error while trying to remove lists ${req.body.list_ids}. Make sure the lists are part of the folder.`,
        });
        return;
      }
    } catch (error) {
      res.status(422).send({
        error: `Error while trying to remove lists ${req.body.list_ids} from folder id ${folder_id}`,
      });
    }
  });

  // Route to move lists from one folder id to another
  app.post('/folder/move_lists', async (req, res) => {
    const { list_ids, from_folder_id, to_folder_id } = req.body;

    if (!list_ids || !Array.isArray(list_ids) || list_ids.length === 0) {
      res.status(422).send({ error: langResources.getResourceString('missingListIds') });
      return;
    }
    if (!Number.isInteger(from_folder_id)) {
      res.status(422).send({ error: langResources.getResourceString('missingSourceFolderId') });
      return;
    }
    if (!Number.isInteger(to_folder_id)) {
      res
        .status(422)
        .send({ error: langResources.getResourceString('missingDestinationFolderId') });
      return;
    }

    try {
      const results = await FolderManager.moveListToFolder(
        req,
        from_folder_id,
        to_folder_id,
        list_ids
      );
      res.send(results);
    } catch (error) {
      res.status(422).send({ error: error.userMessage });
    }
  });

  // Route to update the last access time of a folder
  app.post('/folder/:folder_id/rename_folder', async (req, res) => {
    const folder_id = Number(req.params.folder_id);
    const { folder_name } = req.body;

    if (!folder_name) {
      res.status(422).send({ error: langResources.getResourceString('missingFolderName') });
      return;
    }
    if (Number.isNaN(folder_id)) {
      res.status(422).send({ error: langResources.getResourceString('missingFolderId') });
      return;
    }

    try {
      await FolderManager.updateFolderName(req, folder_id, folder_name);
      const response = await FolderManager.getAllFolders(req);
      res.send(response);
    } catch (error) {
      res.status(422).send({ error: error.userMessage });
      return;
    }
  });

  // Route to update the last access time of a folder
  app.post('/folder/:folder_id/update_access_time', async (req, res) => {
    const folder_id = Number(req.params.folder_id);

    if (Number.isNaN(folder_id)) {
      res.status(422).send({ error: langResources.getResourceString('missingFolderId') });
      return;
    }

    try {
      const response = await FolderManager.updateFolderAccessTime(req, folder_id);
      res.send(response);
    } catch (error) {
      res.status(422).send({ error: error.userMessage });
      return;
    }
  });

  // Route to delete a folder
  app.delete('/folder/:folder_id/delete_folder', async (req, res) => {
    const folder_id = Number(req.params.folder_id);

    if (Number.isNaN(folder_id)) {
      res.status(422).send({ error: langResources.getResourceString('missingFolderId') });
      return;
    }

    try {
      const response = await FolderManager.deleteFolder(req, folder_id);
      res.send(response);
    } catch (error) {
      res.status(422).send({ error: error.userMessage });
    }
  });
};
