from huggingface_hub import HfApi

api = HfApi()

print("Uploading genre classifier...")
api.upload_folder(
    folder_path='E:/Phase0/Kalam/models/genre_classifier',
    repo_id='eo-the-reds/kalam-models',
    path_in_repo='genre_classifier',
    repo_type='model'
)
print("✓ Genre classifier uploaded!")

print("Uploading embeddings...")
api.upload_folder(
    folder_path='E:/Phase0/Kalam/models/embeddings',
    repo_id='eo-the-reds/kalam-models',
    path_in_repo='embeddings',
    repo_type='model'
)
print("✓ Embeddings uploaded!")

print("All done!")