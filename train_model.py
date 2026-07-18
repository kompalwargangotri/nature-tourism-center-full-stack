import json
import os
import re
import math
import sqlite3
from datetime import datetime

# Fixed random seed for reproducibility
RANDOM_SEED = 42

# Predefined stratified training corpus (80 reviews: 40 Positive, 40 Negative)
TRAIN_CORPUS = [
    # Positive (40)
    ("The forest trek was absolute bliss and wonderful.", "Positive"),
    ("Beautiful views, friendly guides, and perfect camping sites.", "Positive"),
    ("Loved the cottage rooms and earthen pot organic dinner.", "Positive"),
    ("An amazing experience under the forest stars, so peaceful.", "Positive"),
    ("Clean cabins, great resort activities, very helpful staff.", "Positive"),
    ("boating was wonderful, highly recommended for families.", "Positive"),
    ("Pristine nature scenery, fresh air, and organic delicious food.", "Positive"),
    ("Best vacation ever, premium service and nice environment.", "Positive"),
    ("Cozy cottages with great amenities, absolute luxury experience.", "Positive"),
    ("Incredible wilderness walks and knowledge guides.", "Positive"),
    ("Great hospitality and delicious traditional buffet.", "Positive"),
    ("Excellent cottage lodging, super clean and nice views.", "Positive"),
    ("Boating adventure was the highlight of our family trip.", "Positive"),
    ("Superb service, friendly rangers, and serene nature.", "Positive"),
    ("Highly recommend the adventure package, so much fun.", "Positive"),
    ("Loved the local recipes, healthy organic farm ingredients.", "Positive"),
    ("Stunning heritage site, clean environment, peaceful getaway.", "Positive"),
    ("Very comfortable cottage rooms, excellent forest trails.", "Positive"),
    ("Eco friendly resort, great conservation effort.", "Positive"),
    ("Perfect place to relax, peaceful forest surroundings.", "Positive"),
    ("Earthen oven food was incredible and very tasty.", "Positive"),
    ("Great guides made our forest trek safe and fun.", "Positive"),
    ("Loved the campfire setup and night sky view.", "Positive"),
    ("Wonderful experience, very clean cottages and rooms.", "Positive"),
    ("Boating under the morning sun was beautiful and calm.", "Positive"),
    ("Resort staff went above and beyond, excellent support.", "Positive"),
    ("Serene atmosphere, perfect place to unwind.", "Positive"),
    ("Delightful organic meals, great local hospitality.", "Positive"),
    ("Amazing adventure package, very exciting forest trekking.", "Positive"),
    ("Pristine cabins, clean sheets, and great view.", "Positive"),
    ("Loved the nature walks, saw beautiful local birds.", "Positive"),
    ("Superb eco resort, highly recommend cottage stays.", "Positive"),
    ("Excellent guides and friendly hospitality.", "Positive"),
    ("Boating outing was peaceful and clean waters.", "Positive"),
    ("Great campfire stories, had a wonderful night.", "Positive"),
    ("Delicious organic buffet options, very healthy.", "Positive"),
    ("Quiet wilderness getaway, extremely comfortable lodging.", "Positive"),
    ("Amazing cottage views, very fresh clean air.", "Positive"),
    ("Loved every minute of our nature tourism stay.", "Positive"),
    ("Fabulous forest lodge, highly recommend for couples.", "Positive"),
    
    # Negative (40)
    ("Very poor cottage rooms, dirty toilets and bad service.", "Negative"),
    ("Boating was cancelled, bad management and support.", "Negative"),
    ("The tents were cold and drafty, very uncomfortable stay.", "Negative"),
    ("Food is overpriced, limited options, bad taste overall.", "Negative"),
    ("Simulator showed wrong price, rude administration staff.", "Negative"),
    ("No running water in cabins, disappointed with service.", "Negative"),
    ("Noise from nearby highway ruined the quiet nature vibe.", "Negative"),
    ("Rude guides, poor safety measures, dangerous trekking.", "Negative"),
    ("Dirty cabins, bad smell, waste of money.", "Negative"),
    ("Terrible experience, overpriced package, bad cottage rooms.", "Negative"),
    ("Cold food, very limited buffet options, rude cooks.", "Negative"),
    ("Boating equipment was broken, extremely unsafe.", "Negative"),
    ("Unfriendly reception, long check-in delay, poor support.", "Negative"),
    ("Trekking trail was blocked, guide did not help.", "Negative"),
    ("Very noisy resort, construction ruined our relaxation.", "Negative"),
    ("Smelly sheets, uncomfortable cottage beds, bad stay.", "Negative"),
    ("Poor hospitality, overpriced addons, disappointed family.", "Negative"),
    ("No lights in cabins, horrible customer care response.", "Negative"),
    ("Tents were leaking rain water, terrible night.", "Negative"),
    ("Limited parking space, rude security staff.", "Negative"),
    ("Bad food options, gave me stomach pain.", "Negative"),
    ("Boating lake was dirty and filled with plastic waste.", "Negative"),
    ("Trekking guide got lost, very poor training.", "Negative"),
    ("Cottage was freezing cold, heater was broken.", "Negative"),
    ("Horrible room service, had to wait hours for water.", "Negative"),
    ("Rude guides and overpriced tours, avoid this.", "Negative"),
    ("Dirty bathrooms, broken shower, very disappointed.", "Negative"),
    ("Noise from generator was loud, ruined the peace.", "Negative"),
    ("Poorly managed packages, simulator rates are confusing.", "Negative"),
    ("Unpleasant smell in cottages, bad ventilation.", "Negative"),
    ("Boating was slow, bad boats, waste of time.", "Negative"),
    ("Very limited activities, boring and overpriced.", "Negative"),
    ("Terrible cottage beds, woke up with back pain.", "Negative"),
    ("Poor customer care, did not resolve my booking issue.", "Negative"),
    ("Guides were late, ruined our forest trek plans.", "Negative"),
    ("Tasteless food, bad quality, dirty kitchen area.", "Negative"),
    ("Broken cabin lock, felt extremely unsafe.", "Negative"),
    ("Mosquitoes everywhere, no repellents, bad experience.", "Negative"),
    ("Boating pricing is misleading, hidden surcharges.", "Negative"),
    ("Worst vacation ever, bad services, rude resort management.", "Negative")
]

# Predefined stratified held-out test dataset (20 reviews: 10 Positive, 10 Negative)
TEST_CORPUS = [
    # Positive (10)
    ("Superb forest trek, wonderful sights and great guide.", "Positive"),
    ("Clean cottages and delicious earthen pot food.", "Positive"),
    (" boater outing was amazing, highly recommended.", "Positive"),
    ("Cozy rooms, helpful staff, and peaceful forest environment.", "Positive"),
    ("Loved the organic buffet, extremely delicious recipes.", "Positive"),
    ("Pristine scenery, friendly rangers, perfect camping getaway.", "Positive"),
    ("Excellent adventure packages, had a fantastic time.", "Positive"),
    ("Quiet wilderness lodge, very clean and comfortable stays.", "Positive"),
    ("Stunning night stars view, cozy campfire setup.", "Positive"),
    ("Great hospitality, beautiful resort grounds, very happy.", "Positive"),
    
    # Negative (10)
    ("Terrible room cleanliness, dirty cottage cabins, poor service.", "Negative"),
    ("Boating lake was closed, bad management and rude guides.", "Negative"),
    ("Overpriced organic buffet, very cold and limited food.", "Negative"),
    ("No water in cottages, broke cabin heater, bad experience.", "Negative"),
    ("Very noisy nights due to generators, ruined relaxation.", "Negative"),
    ("Uncomfortable drafty tents, bad beds, worst vacation.", "Negative"),
    ("Simulator calculations were incorrect, rude customer desk.", "Negative"),
    ("Guides were unfriendly and late, dangerous trekking path.", "Negative"),
    ("Smelly sheets, dirty bathrooms, waste of money.", "Negative"),
    ("Disappointed with the cottages, bad ventilation and services.", "Negative")
]

# Manual regression test set (excluded from validation metrics to test unigram edge cases)
REGRESSION_CORPUS = [
    ("not bad at all, cottage stay was comfortable", "Positive"),
    ("no fun, the guide was rude and late", "Negative"),
    ("could be better, but the boating was peaceful", "Positive"),
    ("did not like the cold rooms, but organic food was great", "Negative")
]

STOP_WORDS = {"the", "and", "a", "of", "to", "in", "is", "for", "with", "on", "at", "was", "were", "had", "been"}

def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    tokens = text.split()
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 2]

def train_sentiment_model():
    print("-----------------------------------------------------------------")
    print("      GreenHaven Eco-Retreat NLP Sentiment Classifier Trainer    ")
    print("-----------------------------------------------------------------")
    
    # Create models folder if missing
    os.makedirs(os.path.join(os.path.dirname(__file__), 'models'), exist_ok=True)
    
    db_path = os.path.join(os.path.dirname(__file__), 'greenhaven.db')
    training_data = []
    
    # Optional: read custom feedback reviews from SQLite
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            c.execute("SELECT text, sentiment_label FROM reviews WHERE sentiment_label IN ('Positive', 'Negative')")
            rows = c.fetchall()
            conn.close()
            for row in rows:
                # Add to training data if not already in validation test set
                test_texts = [t[0].lower().strip() for t in TEST_CORPUS]
                if row[0].lower().strip() not in test_texts:
                    training_data.append((row[0], row[1]))
            print(f"Loaded {len(rows)} database reviews to expand training pool.")
        except Exception as e:
            print(f"Database training read bypassed: {e}")
            
    training_data.extend(TRAIN_CORPUS)
    print(f"Total training dataset size: {len(training_data)} samples.")
    print(f"Held-out validation test dataset size: {len(TEST_CORPUS)} samples.")
    
    # Tokenize training set
    pos_words = {}
    neg_words = {}
    pos_docs = 0
    neg_docs = 0
    vocabulary = set()
    
    for text, label in training_data:
        tokens = preprocess_text(text)
        if label == "Positive":
            pos_docs += 1
            for t in tokens:
                pos_words[t] = pos_words.get(t, 0) + 1
                vocabulary.add(t)
        elif label == "Negative":
            neg_docs += 1
            for t in tokens:
                neg_words[t] = neg_words.get(t, 0) + 1
                vocabulary.add(t)
                
    vocab_size = len(vocabulary)
    pos_total_words = sum(pos_words.values())
    neg_total_words = sum(neg_words.values())
    
    # Priors
    prior_pos = pos_docs / len(training_data)
    prior_neg = neg_docs / len(training_data)
    
    # Build probability tables (Laplace smoothing)
    word_probabilities = {}
    for word in vocabulary:
        p_w_pos = (pos_words.get(word, 0) + 1) / (pos_total_words + vocab_size)
        p_w_neg = (neg_words.get(word, 0) + 1) / (neg_total_words + vocab_size)
        word_probabilities[word] = {
            "positive": p_w_pos,
            "negative": p_w_neg
        }
        
    # Serialize model parameters to models/sentiment_model.json
    model_params = {
        "priors": {
            "positive": prior_pos,
            "negative": prior_neg
        },
        "word_probabilities": word_probabilities,
        "vocab_size": vocab_size,
        "pos_total_words": pos_total_words,
        "neg_total_words": neg_total_words
    }
    
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'sentiment_model.json')
    with open(model_path, 'w', encoding='utf-8') as f:
        json.dump(model_params, f, indent=2)
    print(f"Model parameters successfully saved to {model_path}")
    
    # Predict on held-out test set
    tp = fp = tn = fn = 0
    
    for text, label in TEST_CORPUS:
        tokens = preprocess_text(text)
        # Multinomial Naive Bayes inference logs
        log_pos = math.log(prior_pos)
        log_neg = math.log(prior_neg)
        
        for t in tokens:
            if t in word_probabilities:
                log_pos += math.log(word_probabilities[t]["positive"])
                log_neg += math.log(word_probabilities[t]["negative"])
                
        # Class probabilities via log-sum-exp normalization
        max_log = max(log_pos, log_neg)
        exp_pos = math.exp(log_pos - max_log)
        exp_neg = math.exp(log_neg - max_log)
        sum_exp = exp_pos + exp_neg
        
        prob_pos = exp_pos / sum_exp
        prob_neg = exp_neg / sum_exp
        
        pred_label = "Positive" if prob_pos > prob_neg else "Negative"
        
        if label == "Positive":
            if pred_label == "Positive":
                tp += 1
            else:
                fn += 1
        elif label == "Negative":
            if pred_label == "Negative":
                tn += 1
            else:
                fp += 1
                
    # Compile Metrics
    accuracy = (tp + tn) / len(TEST_CORPUS)
    
    # Positive-class metrics
    pos_precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    pos_recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    pos_f1 = (2 * pos_precision * pos_recall) / (pos_precision + pos_recall) if (pos_precision + pos_recall) > 0 else 0
    
    # Negative-class metrics
    neg_precision = tn / (tn + fn) if (tn + fn) > 0 else 0
    neg_recall = tn / (tn + fp) if (tn + fp) > 0 else 0
    neg_f1 = (2 * neg_precision * neg_recall) / (neg_precision + neg_recall) if (neg_precision + neg_recall) > 0 else 0
    
    # Macro averages
    macro_precision = (pos_precision + neg_precision) / 2
    macro_recall = (pos_recall + neg_recall) / 2
    macro_f1 = (pos_f1 + neg_f1) / 2
    
    # Weighted averages
    total_pos_test = tp + fn
    total_neg_test = tn + fp
    total_test = len(TEST_CORPUS)
    weighted_precision = (pos_precision * total_pos_test + neg_precision * total_neg_test) / total_test
    weighted_recall = (pos_recall * total_pos_test + neg_recall * total_neg_test) / total_test
    weighted_f1 = (pos_f1 * total_pos_test + neg_f1 * total_neg_test) / total_test
    
    print("\n-----------------------------------------------------------------")
    print("                 Sentiment Classifier Evaluation Metrics          ")
    print("-----------------------------------------------------------------")
    print(f"Accuracy: {accuracy * 100:.1f}%")
    print(f"Positive-Class Precision: {pos_precision:.3f} | Recall: {pos_recall:.3f} | F1: {pos_f1:.3f}")
    print(f"Negative-Class Precision: {neg_precision:.3f} | Recall: {neg_recall:.3f} | F1: {neg_f1:.3f}")
    print(f"Confusion Matrix: [[TN={tn}, FP={fp}], [FN={fn}, TP={tp}]]")
    
    # Serialize metadata models/model_card.json (replacing existing metrics object)
    model_card = {
        "model_details": {
            "name": "GreenHaven Naive Bayes Sentiment Classifier",
            "version": "1.0",
            "type": "Multinomial Naive Bayes Text Classifier",
            "training_timestamp": datetime.now().isoformat(),
            "random_seed": RANDOM_SEED,
            "artifact_filename": "models/sentiment_model.json"
        },
        "preprocessing": {
            "lowercase": True,
            "strip_punctuation": True,
            "stop_words_removed": list(STOP_WORDS),
            "minimum_token_length": 3
        },
        "data_distributions": {
            "training_samples_size": len(training_data),
            "training_class_counts": {
                "positive": pos_docs,
                "negative": neg_docs
            },
            "held_out_test_size": len(TEST_CORPUS),
            "test_class_counts": {
                "positive": total_pos_test,
                "negative": total_neg_test
            },
            "vocabulary_size": vocab_size
        },
        "evaluation_metrics": {
            "global_accuracy": round(accuracy, 4),
            "confusion_matrix": {
                "true_negatives": tn,
                "false_positives": fp,
                "false_negatives": fn,
                "true_positives": tp
            },
            "positive_class": {
                "precision": round(pos_precision, 4),
                "recall": round(pos_recall, 4),
                "f1_score": round(pos_f1, 4)
            },
            "negative_class": {
                "precision": round(neg_precision, 4),
                "recall": round(neg_recall, 4),
                "f1_score": round(neg_f1, 4)
            },
            "macro_averages": {
                "precision": round(macro_precision, 4),
                "recall": round(macro_recall, 4),
                "f1_score": round(macro_f1, 4)
            },
            "weighted_averages": {
                "precision": round(weighted_precision, 4),
                "recall": round(weighted_recall, 4),
                "f1_score": round(weighted_f1, 4)
            }
        },
        "evaluation_limitations": {
            "limited_dataset_disclaimer": "Evaluation metrics demonstrate the implementation pipeline and should not be interpreted as production-level model performance because of the limited dataset.",
            "algorithmic_boundaries": "Unigram bag-of-words model struggles to identify logical negations (e.g. 'not bad') and complex contextual grammar cues."
        }
    }
    
    card_path = os.path.join(os.path.dirname(__file__), 'models', 'model_card.json')
    with open(card_path, 'w', encoding='utf-8') as f:
        json.dump(model_card, f, indent=2)
    print(f"Model card metadata saved to {card_path}\n")

if __name__ == '__main__':
    train_sentiment_model()
