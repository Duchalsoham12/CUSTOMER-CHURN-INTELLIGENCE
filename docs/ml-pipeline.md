# ML Pipeline

The trained artifacts include Logistic Regression, Random Forest, and XGBoost comparison outputs. Random Forest is the configured model version `churn_rf_v1` based on saved validation metrics.

The model excludes target-adjacent outcome/text fields. Predictions are probability estimates, not causal findings. Native scikit-learn/SciPy loading is currently blocked by the local Windows Application Control policy.
