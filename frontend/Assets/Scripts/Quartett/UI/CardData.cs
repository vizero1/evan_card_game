using System;
using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;

public class CardData : MonoBehaviour
{
    public enum CardDataType
    {
        None,
        Headline,
        Img,
        Attr1,
        Attr2,
        Attr3,
        Attr4,
        Attr5
    }
    public CardDataType Type;
    private TextMesh _textMesh;
    private Renderer _renderer;

    void Start()
    {
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;
        if (Type != CardDataType.Img && Type != CardDataType.None)
        {
            _textMesh = this.GetComponent<TextMesh>();
        }
        _renderer = this.GetComponent<Renderer>();
        _renderer.enabled = false;
    }

    void OnDestroy()
    {
        Events.Instance.OnGameplayStatusChange -= GameplayStatusChange;
    }

    void GameplayStatusChange(GameplayStatus oldMatchStatus, GameplayStatus newMatchStatus)
    {
        switch (newMatchStatus)
        {
            case GameplayStatus.GetCard:
                UpdateCard();
                break;
            case GameplayStatus.OpenCard:
                Timer.Instance.Add(0.2f, () =>
                {
                    _renderer.enabled = true;
                });
                break;
        }
    }

    private void UpdateCard()
    {
        var card = GameHandler.Instance.CurrentCard;
        switch (Type)
        {
            case CardDataType.Headline:
                this._textMesh.text = card.Name;
                break;
            case CardDataType.Img:
                var index = card.Id - 1;
                var sprite = Config.Instance.CardImages[index];
                this.GetComponent<SpriteRenderer>().sprite = sprite;
                break;
            case CardDataType.Attr1:
                this._textMesh.text = "MarketCap: " + card.MarketCap;
                break;
            case CardDataType.Attr2:
                this._textMesh.text = "Price: " + card.Price + " $";
                break;
            case CardDataType.Attr3:
                this._textMesh.text = "Rank: #" + card.Rank;
                break;
            case CardDataType.Attr4:
                this._textMesh.text = "IssueDate: " + card.IssueDate;
                break;
            case CardDataType.Attr5:
                this._textMesh.text = "Twitter: " + card.TwitterFollowers + " Followers";
                break;
        }

    }

}
