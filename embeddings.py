import glob
import time

import numpy as np
import pandas as pd
from tensorflow.keras.applications import InceptionV3
from tensorflow.keras.applications.inception_v3 import preprocess_input
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import img_to_array, load_img


def get_image_embeddings(paths):
  # Load the model. Currently using an Inception model but this is probably
  # slow, see if we can use a distilled model.
  base = InceptionV3(include_top=True, weights='imagenet',)
  model = Model(inputs=base.input, outputs=base.get_layer('avg_pool').output)

  def get_embedding_(path):
    try:
      image = load_img(path)
    except Exception as exc:
      print('Image at path ', path, 'could not be processed --', exc)
      return None, None
    preprocessed_image = preprocess_input(
      img_to_array(image.resize((299, 299))))
    return model.predict(np.expand_dims(preprocessed_image, 0)).squeeze(), path

  paths_df = pd.Series(paths)

  start = time.time()
  embeddings_filepaths = paths_df.map(get_embedding_).dropna()
  stop = time.time()

  print("Time taken: ", stop - start)
  return embeddings_filepaths


if __name__ == '__main__':
  DATA_PATH = '/home/amol/Code/repos/high-dimensional-data-viz/data/*/*'
  file_names = glob.glob(DATA_PATH)
  embeddings = get_image_embeddings(file_names)
  import IPython; IPython.embed()