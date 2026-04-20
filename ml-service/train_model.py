from app.model import generate_training_data, train_model


if __name__ == "__main__":
    generate_training_data()
    metrics = train_model()
    print(metrics)
